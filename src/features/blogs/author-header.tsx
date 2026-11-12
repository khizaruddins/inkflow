'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { redirectToLogin, isUnauthorizedError } from '@/lib/auth-redirect';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { AuthService } from '@/services/auth.service';
import { ClapButton } from './clap-button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Author } from '@/types';

interface AuthorHeaderProps {
  author: Author;
  postId?: string;
  postTitle?: string;
  postSlug?: string;
  coverImage?: string;
  readingTimeMinutes?: number;
  publishedAt?: string | null;
  clapsCount?: number;
  isDraft?: boolean;
  unlockToken?: string;
}

export function AuthorHeader({
  author,
  postId,
  postTitle,
  postSlug,
  coverImage,
  readingTimeMinutes,
  publishedAt,
  clapsCount = 0,
  isDraft = false,
  unlockToken,
}: AuthorHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookmarkSuccessToast, setBookmarkSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthState = mounted && isAuthenticated && Boolean(user);
  const isSelfAuthor = user && (user.id === author.id || user.username === author.username);
  const isFollowing = Boolean(user?.followingUserIds?.includes(author.id));
  const bookmarked = postId && showAuthState ? isBookmarked(postId) : false;

  // View counts and reading history are recorded upon verified reading completion in ArticleReadTracker.

  const handleToggleBookmark = async () => {
    if (!postId) return;
    if (!isAuthenticated || !user) {
      redirectToLogin(router);
      return;
    }
    try {
      const bookmarkedNow = await toggleBookmark(postId, unlockToken);
      setBookmarkSuccessToast(bookmarkedNow ? 'Saved to bookmarks!' : 'Removed from bookmarks');
      setTimeout(() => setBookmarkSuccessToast(null), 2500);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToLogin(router);
      }
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated || !user) {
      redirectToLogin(router);
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.toggleFollowUser(author.id, author.name);
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            followingUserIds: res.followingUserIds,
            followingCount: res.followingUserIds.length,
          },
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/60 font-sans relative">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt={author.name}
          name={author.name}
          role={author.role}
          size="lg"
          pxSize={44}
          containerClassName="w-11 h-11 ring-2 ring-emerald-500/20"
        />
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/author/${author.username}`}
              className="text-sm font-bold text-foreground hover:underline tracking-tight"
            >
              {author.name}
            </Link>
            {!isSelfAuthor && (
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={loading}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs ${
                  isFollowing
                    ? 'bg-muted text-foreground border border-border/80 hover:border-red-500/50 hover:text-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {loading ? (
                  <Skeleton variant="pill" className="w-12 h-3.5" />
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 whitespace-pre-wrap">
            {author.bio || 'Writer on InkFlow'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {postId && (
          <ClapButton
            postId={postId}
            authorId={author.id}
            initialClapsCount={clapsCount}
            isDraft={isDraft}
            unlockToken={unlockToken}
          />
        )}

        {/* Bookmark Action Button */}
        {postId && (
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                bookmarked
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/50'
              }`}
              title={bookmarked ? 'Saved to bookmarks (click to remove)' : 'Bookmark story for later'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {bookmarkSuccessToast && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-xl z-30">
                {bookmarkSuccessToast}
              </div>
            )}
          </div>
        )}

        {readingTimeMinutes && (
          <div className="text-xs text-muted-foreground hidden sm:block font-sans">
            {readingTimeMinutes} min read
          </div>
        )}
      </div>
    </div>
  );
}
