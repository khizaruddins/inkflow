'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, LogIn } from 'lucide-react';
import { EditorNavbar } from '@/features/editor/editor-navbar';
import { TipTapEditor } from '@/features/editor/tiptap-editor';
import { SEODrawer } from '@/features/editor/seo-drawer';
import { PublishModal } from '@/features/editor/publish-modal';
import { useEditorStore, emptyPost } from '@/store/use-editor-store';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { Button } from '@/components/ui/button';
import { EditorPageSkeleton } from '@/components/skeletons/page-skeletons';
import { getLoginRedirectUrl } from '@/lib/auth-redirect';

export default function NewPostPage() {
  const router = useRouter();
  const { currentPost, updateField, resetEditor, setSaveStatus } = useEditorStore();
  const { user, role, isAuthenticated, isCheckingAuth } = useAuthStore();
  const [isSEODrawerOpen, setIsSEODrawerOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const isReaderOnly = String(role || 'reader').toLowerCase() === 'reader';

  // Track last saved content snapshot for strict diff checking
  const lastSavedRef = useRef<{
    title: string;
    subtitle: string;
    content: string;
    visibility: string;
    privateKey: string;
  }>({
    title: '',
    subtitle: '',
    content: '',
    visibility: isReaderOnly ? 'private' : 'public',
    privateKey: '',
  });

  useEffect(() => {
    const initialVisibility = isReaderOnly ? 'private' : 'public';
    resetEditor({ ...emptyPost, visibility: initialVisibility });
    lastSavedRef.current = {
      title: '',
      subtitle: '',
      content: '',
      visibility: initialVisibility,
      privateKey: '',
    };
  }, [resetEditor, isReaderOnly]);

  // 5-second inactivity auto-save debounce effect with diff checking
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const title = currentPost.title || '';
    const subtitle = currentPost.subtitle || '';
    const content = currentPost.content || '';
    const visibility = currentPost.visibility || (isReaderOnly ? 'private' : 'public');
    const privateKey = JSON.stringify({
      privateLockType: currentPost.privateLockType || 'NONE',
      allowLinkPasswordAccess: currentPost.allowLinkPasswordAccess ?? true,
      requirePasswordForGrantedUsers: Boolean(currentPost.requirePasswordForGrantedUsers),
      requireFollowerToView: Boolean(currentPost.requireFollowerToView),
    });

    const hasAnyContent =
      title.trim() !== '' ||
      subtitle.trim() !== '' ||
      (content.trim() !== '' && content.trim() !== '<p></p>');

    if (!hasAnyContent) return;

    const isDirty =
      title !== lastSavedRef.current.title ||
      subtitle !== lastSavedRef.current.subtitle ||
      content !== lastSavedRef.current.content ||
      visibility !== lastSavedRef.current.visibility ||
      privateKey !== lastSavedRef.current.privateKey;

    if (!isDirty) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const titleToSend = title.trim() || 'Untitled';
        const subtitleToSend = subtitle.trim() || 'Untitled Subtitle';
        const lockType = currentPost.privateLockType || 'NONE';
        const rawSecret = (currentPost.secretPassword || '').trim();
        const safeSecret =
          lockType === 'PIN' && rawSecret && !/^\d{4,8}$/.test(rawSecret) ? undefined : rawSecret;

        const savedDraft = await BlogService.saveDraft({
          ...currentPost,
          visibility,
          secretPassword: safeSecret,
          id: currentPost.id || undefined,
          title: titleToSend,
          subtitle: subtitleToSend,
        });

        lastSavedRef.current = {
          title,
          subtitle,
          content,
          visibility,
          privateKey,
        };

        if (savedDraft?.id) {
          updateField('id', savedDraft.id);
          if (typeof window !== 'undefined' && !window.location.pathname.includes(savedDraft.id)) {
            window.history.replaceState(null, '', `/dashboard/posts/${savedDraft.id}`);
          }
        }
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('draft');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    user,
    isReaderOnly,
    currentPost.title,
    currentPost.subtitle,
    currentPost.content,
    currentPost.id,
    currentPost.visibility,
    currentPost.privateLockType,
    currentPost.allowLinkPasswordAccess,
    currentPost.requirePasswordForGrantedUsers,
    currentPost.requireFollowerToView,
    setSaveStatus,
    updateField,
  ]);

  if (isCheckingAuth) {
    return <EditorPageSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In to Write
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to write and share private stories protected with a PIN, password, or invited readers.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href={getLoginRedirectUrl('/dashboard/posts/new')} className="block">
              <Button variant="primary" size="md" className="w-full text-xs font-semibold gap-1.5">
                <LogIn className="w-4 h-4" /> Sign In to Continue
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" size="md" className="w-full text-xs font-semibold gap-1">
                <ArrowLeft className="w-4 h-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenPublishModal = () => {
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    const postState = useEditorStore.getState().currentPost;
    const effectiveVisibility = isReaderOnly ? 'private' : postState.visibility || 'public';
    const payload = {
      ...postState,
      visibility: effectiveVisibility,
      status: 'published' as const,
    };

    if (postState.id) {
      await BlogService.updatePost(postState.id, payload);
    } else {
      await BlogService.createPost(payload);
    }
    setIsPublishModalOpen(false);
    router.push(effectiveVisibility === 'private' ? '/dashboard/posts?tab=mine' : '/dashboard/posts');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Authentic Medium Top Bar */}
      <EditorNavbar
        onPublish={handleOpenPublishModal}
        onOpenSEO={() => setIsSEODrawerOpen(true)}
      />

      {/* Seamless Writing Canvas */}
      <main className="max-w-4xl mx-auto py-12 px-12 sm:px-16 md:px-20 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={currentPost.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Title"
          className="w-full text-5xl md:text-6xl font-serif font-medium tracking-tight bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 leading-tight"
        />

        {/* Subtitle Input */}
        <input
          type="text"
          value={currentPost.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="Add a subtitle..."
          className="w-full text-xl md:text-2xl font-serif text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-8"
        />

        {/* TipTap Rich Text Editor */}
        <TipTapEditor />
      </main>

      {/* SEO & Publishing Settings Drawer */}
      <SEODrawer isOpen={isSEODrawerOpen} onClose={() => setIsSEODrawerOpen(false)} />

      {/* Publish & Tag Selection Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
}
