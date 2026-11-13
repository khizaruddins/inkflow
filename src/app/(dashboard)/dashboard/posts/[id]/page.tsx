'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, LogIn, RotateCcw, ShieldAlert } from 'lucide-react';
import { EditorNavbar } from '@/features/editor/editor-navbar';
import { TipTapEditor } from '@/features/editor/tiptap-editor';
import { SEODrawer } from '@/features/editor/seo-drawer';
import { PublishModal } from '@/features/editor/publish-modal';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { EditorPageSkeleton } from '@/components/skeletons/page-skeletons';
import { useEditorStore, emptyPost } from '@/store/use-editor-store';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { formatDate } from '@/lib/utils';
import {
  extractApiError,
  getLoginRedirectUrl,
  isUnauthorizedError,
  redirectToLogin,
} from '@/lib/auth-redirect';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const { currentPost, updateField, resetEditor, setSaveStatus, versions, restoreVersion } = useEditorStore();
  const { user, role, isAuthenticated, isCheckingAuth } = useAuthStore();
  const [isSEODrawerOpen, setIsSEODrawerOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<{ status?: number; message: string } | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const isReaderOnly = String(role || 'reader').toLowerCase() === 'reader';

  // Baseline snapshot of post as loaded / published from database
  const [publishedSnapshot, setPublishedSnapshot] = useState<{
    title: string;
    subtitle: string;
    content: string;
    coverImage: string;
    categoryId: string;
    tags: string;
    status: string;
    visibility: string;
    privateKey: string;
  } | null>(null);

  // Track last saved snapshot for diff checking
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
    visibility: 'public',
    privateKey: '',
  });

  const loadedPostIdRef = useRef<string | null>(null);
  const isFetchingPostRef = useRef(false);

  // Fetch full editable post from backend (/posts/:id/edit) on initial load/explicit retry
  useEffect(() => {
    let isCancelled = false;

    async function loadPostFromDb() {
      if (!postId || isCheckingAuth) return;

      // If already loaded for this postId and not an explicit retry, never reload or wipe active editor
      if (loadedPostIdRef.current === postId && reloadNonce === 0) {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      if (isFetchingPostRef.current) return;
      isFetchingPostRef.current = true;

      if (!hasLoaded) {
        setLoading(true);
        resetEditor(emptyPost, 'draft');
      }
      setLoadError(null);

      try {
        const fetched = await BlogService.getPostForEdit(postId);
        if (isCancelled) return;

        if (fetched) {
          const postToReset = { ...fetched };
          if (
            (!postToReset.coverImage || postToReset.coverImage.includes('photo-1618005182384-a83a8bd57fbe')) &&
            postToReset.content
          ) {
            const match = postToReset.content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match && match[1]) {
              postToReset.coverImage = match[1].replace(/&amp;/g, '&');
            }
          }
          const initialPrivateKey = JSON.stringify({
            privateLockType: postToReset.privateLockType || 'NONE',
            allowLinkPasswordAccess: postToReset.allowLinkPasswordAccess ?? true,
            requirePasswordForGrantedUsers: Boolean(postToReset.requirePasswordForGrantedUsers),
            requireFollowerToView: Boolean(postToReset.requireFollowerToView),
          });
          resetEditor(postToReset, 'saved');
          loadedPostIdRef.current = postId;
          lastSavedRef.current = {
            title: postToReset.title || '',
            subtitle: postToReset.subtitle || '',
            content: postToReset.content || '',
            visibility: postToReset.visibility || 'public',
            privateKey: initialPrivateKey,
          };
          setPublishedSnapshot({
            title: (fetched.title || '').trim(),
            subtitle: (fetched.subtitle || '').trim(),
            content: (fetched.content || '').trim(),
            coverImage: (fetched.coverImage || '').trim(),
            categoryId: fetched.category?.id || '',
            tags: (fetched.tags || []).map((t) => t.id).sort().join(','),
            status: fetched.status || 'draft',
            visibility: fetched.visibility || 'public',
            privateKey: initialPrivateKey,
          });
          setHasLoaded(true);
        }
      } catch (err) {
        if (isCancelled) return;
        if (isUnauthorizedError(err)) {
          redirectToLogin(router, `/dashboard/posts/${postId}`);
          return;
        }
        const parsed = extractApiError(err, 'Unable to load this story for editing.');
        setLoadError({
          status: parsed.status,
          message:
            parsed.status === 403
              ? parsed.message || 'Only the post author can edit this story.'
              : parsed.message,
        });
      } finally {
        isFetchingPostRef.current = false;
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadPostFromDb();
    return () => {
      isCancelled = true;
    };
  }, [postId, isCheckingAuth, isAuthenticated, reloadNonce, router, resetEditor, hasLoaded]);

  // 5-second inactivity auto-save debounce effect with diff checking
  useEffect(() => {
    if (loading || !hasLoaded || Boolean(loadError) || !isAuthenticated) return;

    const title = currentPost.title || '';
    const subtitle = currentPost.subtitle || '';
    const content = currentPost.content || '';
    const visibility = currentPost.visibility || 'public';
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

    // Diff check: Only call API if content or privacy settings changed since last save
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
        const lockType = currentPost.privateLockType || 'NONE';
        const rawSecret = (currentPost.secretPassword || '').trim();
        const safeSecret =
          lockType === 'PIN' && rawSecret && !/^\d{4,8}$/.test(rawSecret) ? undefined : rawSecret;

        const savedDraft = await BlogService.saveDraft({
          ...currentPost,
          secretPassword: safeSecret,
          id: currentPost.id || postId,
          title: title.trim(),
          subtitle: subtitle.trim(),
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
        }
        setSaveStatus('saved');
      } catch (err) {
        // Do not redirect to login or throw errors during background autosave
        setSaveStatus('draft');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [
    loading,
    hasLoaded,
    loadError,
    isAuthenticated,
    currentPost.title,
    currentPost.subtitle,
    currentPost.content,
    currentPost.id,
    currentPost.visibility,
    currentPost.privateLockType,
    currentPost.allowLinkPasswordAccess,
    currentPost.requirePasswordForGrantedUsers,
    currentPost.requireFollowerToView,
    postId,
    setSaveStatus,
    updateField,
  ]);

  if (loading || isCheckingAuth) {
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
              Sign In Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to edit and manage your stories.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href={getLoginRedirectUrl(`/dashboard/posts/${postId}`)} className="block">
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

  if (loadError) {
    const isForbidden = loadError.status === 403;
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {isForbidden ? 'Author Access Only' : 'Unable to Load Story'}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {loadError.message}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/dashboard/posts" className="block">
              <Button variant="primary" size="md" className="w-full text-xs font-semibold gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back to Blog Management
              </Button>
            </Link>

            {!isForbidden && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setReloadNonce((n) => n + 1)}
                className="w-full text-xs font-semibold gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isPublished =
    publishedSnapshot?.status === 'published' || currentPost.status === 'published';

  const currentPrivateKey = JSON.stringify({
    privateLockType: currentPost.privateLockType || 'NONE',
    allowLinkPasswordAccess: currentPost.allowLinkPasswordAccess ?? true,
    requirePasswordForGrantedUsers: Boolean(currentPost.requirePasswordForGrantedUsers),
    requireFollowerToView: Boolean(currentPost.requireFollowerToView),
  });

  const hasChanges = Boolean(
    publishedSnapshot && (
      (currentPost.title || '').trim() !== publishedSnapshot.title ||
      (currentPost.subtitle || '').trim() !== publishedSnapshot.subtitle ||
      (currentPost.content || '').trim() !== publishedSnapshot.content ||
      (currentPost.coverImage || '').trim() !== publishedSnapshot.coverImage ||
      (currentPost.category?.id || '') !== publishedSnapshot.categoryId ||
      (currentPost.tags || []).map((t) => t.id).sort().join(',') !== publishedSnapshot.tags ||
      (currentPost.visibility || 'public') !== publishedSnapshot.visibility ||
      currentPrivateKey !== publishedSnapshot.privateKey ||
      Boolean(currentPost.secretPassword?.trim())
    )
  );

  const showPublishButton = !isPublished || hasChanges;

  const handleOpenPublishModal = () => {
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    const postState = useEditorStore.getState().currentPost;
    const effectiveVisibility = isReaderOnly ? 'private' : postState.visibility || 'public';
    await BlogService.updatePost(postId || postState.id || '', {
      ...postState,
      visibility: effectiveVisibility,
      status: 'published',
    });
    const nextPrivateKey = JSON.stringify({
      privateLockType: postState.privateLockType || 'NONE',
      allowLinkPasswordAccess: postState.allowLinkPasswordAccess ?? true,
      requirePasswordForGrantedUsers: Boolean(postState.requirePasswordForGrantedUsers),
      requireFollowerToView: Boolean(postState.requireFollowerToView),
    });
    setPublishedSnapshot({
      title: (postState.title || '').trim(),
      subtitle: (postState.subtitle || '').trim(),
      content: (postState.content || '').trim(),
      coverImage: (postState.coverImage || '').trim(),
      categoryId: postState.category?.id || '',
      tags: (postState.tags || []).map((t) => t.id).sort().join(','),
      status: 'published',
      visibility: effectiveVisibility,
      privateKey: nextPrivateKey,
    });
    setIsPublishModalOpen(false);
    router.push(effectiveVisibility === 'private' ? '/dashboard/posts?tab=mine' : '/dashboard/posts');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Authentic Medium Top Bar */}
      <EditorNavbar
        onPublish={handleOpenPublishModal}
        onOpenSEO={() => setIsSEODrawerOpen(true)}
        isPublished={isPublished}
        hasChanges={hasChanges}
        showPublishButton={showPublishButton}
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
        isPublished={isPublished}
      />
    </div>
  );
}
