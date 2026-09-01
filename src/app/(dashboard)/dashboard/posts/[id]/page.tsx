'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, UserCheck, RotateCcw } from 'lucide-react';
import { EditorNavbar } from '@/features/editor/editor-navbar';
import { TipTapEditor } from '@/features/editor/tiptap-editor';
import { SEODrawer } from '@/features/editor/seo-drawer';
import { PublishModal } from '@/features/editor/publish-modal';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/use-editor-store';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { formatDate } from '@/lib/utils';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const { currentPost, updateField, resetEditor, setSaveStatus, versions, restoreVersion } = useEditorStore();
  const { role, toggleDemoRole } = useAuthStore();
  const [isSEODrawerOpen, setIsSEODrawerOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track last saved snapshot for diff checking
  const lastSavedRef = useRef<{ title: string; subtitle: string; content: string }>({
    title: '',
    subtitle: '',
    content: '',
  });

  // Fetch draft post from backend on load/reload
  useEffect(() => {
    async function loadPostFromDb() {
      if (!postId) return;
      try {
        setLoading(true);
        const fetched = await BlogService.getPostBySlug(postId);
        if (fetched) {
          resetEditor(fetched, 'saved');
          lastSavedRef.current = {
            title: fetched.title || '',
            subtitle: fetched.subtitle || '',
            content: fetched.content || '',
          };
        }
      } catch (err) {
        console.error('Error loading saved post draft:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPostFromDb();
  }, [postId, resetEditor]);

  // 5-second inactivity auto-save debounce effect with diff checking
  useEffect(() => {
    if (loading) return;

    const title = currentPost.title || '';
    const subtitle = currentPost.subtitle || '';
    const content = currentPost.content || '';

    const hasAnyContent =
      title.trim() !== '' ||
      subtitle.trim() !== '' ||
      (content.trim() !== '' && content.trim() !== '<p></p>');

    if (!hasAnyContent) return;

    // Diff check: Only call API if content has changed since last save
    const isDirty =
      title !== lastSavedRef.current.title ||
      subtitle !== lastSavedRef.current.subtitle ||
      content !== lastSavedRef.current.content;

    if (!isDirty) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const titleToSend = title.trim() || 'Untitled';
        const subtitleToSend = subtitle.trim() || 'Untitled Subtitle';

        const savedDraft = await BlogService.saveDraft({
          ...currentPost,
          id: postId || currentPost.id,
          title: titleToSend,
          subtitle: subtitleToSend,
        });

        lastSavedRef.current = {
          title,
          subtitle,
          content,
        };

        if (savedDraft?.id) {
          updateField('id', savedDraft.id);
        }
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('draft');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentPost.title, currentPost.subtitle, currentPost.content, currentPost.id, postId, loading, setSaveStatus, updateField]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading story draft...</p>
        </div>
      </div>
    );
  }

  if (role === 'reader') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Writer Access Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account is currently in <strong>READER</strong> mode. Readers can explore stories, clap, reply to comments, and manage reading lists, but are not permitted to write or publish blog posts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={toggleDemoRole}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Switch to Writer / Admin Role
            </Button>

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
    await BlogService.updatePost(postId || postState.id || '', {
      ...postState,
      status: 'published',
    });
    setIsPublishModalOpen(false);
    router.push('/dashboard/posts');
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

      {/* Version History Drawer */}
      <Drawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Version History"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">Restore previous snapshots of this story:</p>
          <div className="space-y-3">
            {versions.map((ver) => (
              <div key={ver.id} className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{formatDate(ver.savedAt)}</span>
                  <span className="text-[10px] text-muted-foreground">by {ver.authorName}</span>
                </div>
                <p className="text-xs font-serif line-clamp-1">{ver.title}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    restoreVersion(ver.id);
                    setIsHistoryOpen(false);
                  }}
                  className="w-full text-xs gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restore Snapshot
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Drawer>

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
