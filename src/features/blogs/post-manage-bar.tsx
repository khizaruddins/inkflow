'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Users,
  Share2,
  Check,
  PenSquare,
  Settings,
  Lock,
  Globe,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { BlogService } from '@/services/blog.service';
import { PrivatePostSettingsModal } from '@/features/dashboard/private-settings-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types';

interface PostManageBarProps {
  post: BlogPost;
  shareToken?: string;
  onPostUpdated?: (updated: BlogPost) => void;
}

/**
 * Inline author & admin management bar displayed directly on a blog post page.
 * Strictly visible and actionable only for the original author or system Admin.
 */
export function PostManageBar({
  post,
  shareToken: initialShareToken,
  onPostUpdated,
}: PostManageBarProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost>(post);
  const [viewsCount, setViewsCount] = useState<number>(post.viewsCount ?? 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPost(post);
    setViewsCount(post.viewsCount ?? 0);
  }, [post]);

  useEffect(() => {
    const handleViewRecorded = (event: Event) => {
      const custom = event as CustomEvent<{ postId?: string; viewsCount?: number }>;
      if (custom.detail?.postId === currentPost.id && typeof custom.detail.viewsCount === 'number') {
        setViewsCount(custom.detail.viewsCount);
      }
    };
    window.addEventListener('inkflow:view-recorded', handleViewRecorded);
    return () => window.removeEventListener('inkflow:view-recorded', handleViewRecorded);
  }, [currentPost.id]);

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const isOriginalAuthor = Boolean(
    user?.id && (user.id === currentPost.authorId || user.id === currentPost.author?.id)
  );
  const canManage = mounted && isAuthenticated && (isAdmin || isOriginalAuthor);

  if (!canManage) {
    return null;
  }

  const isPrivate = currentPost.visibility === 'private';
  const resolvedShareToken = currentPost.shareToken || initialShareToken || '';
  const sharedCount = currentPost.sharedCount ?? 0;

  const lockLabel =
    currentPost.privateLockType === 'PIN'
      ? 'PIN Protected'
      : currentPost.privateLockType === 'PASSWORD'
        ? 'Password Protected'
        : isPrivate
          ? 'Invited / Link Access'
          : 'Public';

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined' || copying) return;
    setCopying(true);
    try {
      let token = resolvedShareToken;
      if (isPrivate && !token) {
        const settings = await BlogService.getPrivateSettings(currentPost.id);
        token = settings.post.shareToken || '';
        setCurrentPost(settings.post);
      }
      const targetUrl =
        isPrivate && token
          ? `${window.location.origin}/blog/${currentPost.slug}?share=${token}`
          : `${window.location.origin}/blog/${currentPost.slug}`;
      await navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback: copy current location
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        // Ignore clipboard denial
      }
    } finally {
      setCopying(false);
    }
  };

  const handleModalUpdated = (updated?: BlogPost) => {
    if (updated) {
      setCurrentPost(updated);
      if (typeof updated.viewsCount === 'number') {
        setViewsCount(updated.viewsCount);
      }
      onPostUpdated?.(updated);
    }
    router.refresh();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-3.5 sm:px-5 rounded-2xl bg-card/85 border border-border/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <Badge variant={isPrivate ? 'warning' : 'success'} className="gap-1">
            {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {lockLabel}
          </Badge>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-foreground font-semibold">
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            {viewsCount.toLocaleString()} {viewsCount === 1 ? 'view' : 'views'}
          </span>

          {(isPrivate || sharedCount > 0) && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60 text-foreground font-semibold"
              title="Readers invited or granted access to this private story"
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              {sharedCount.toLocaleString()} {sharedCount === 1 ? 'person shared' : 'people shared'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            isLoading={copying}
            onClick={handleCopyShareLink}
            className="rounded-xl gap-1.5 text-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied' : isPrivate ? 'Share Private Link' : 'Share Post'}
          </Button>

          <Link href={`/dashboard/posts/${currentPost.id}`}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5 text-xs"
            >
              <PenSquare className="w-3.5 h-3.5" />
              Edit Post
            </Button>
          </Link>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open post settings and sharing modal"
            title="Post Settings (Visibility, PIN/Password, Share Link, Readers)"
            className="rounded-xl h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <PrivatePostSettingsModal
        isOpen={settingsOpen}
        postId={currentPost.id}
        onClose={() => setSettingsOpen(false)}
        onUpdated={handleModalUpdated}
      />
    </>
  );
}
