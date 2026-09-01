'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { AuthService } from '@/services/auth.service';
import { LibraryService } from '@/services/library.service';
import { ClapButton } from './clap-button';
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
}: AuthorHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const [loading, setLoading] = useState(false);
  const [bookmarkSuccessToast, setBookmarkSuccessToast] = useState<string | null>(null);

  const isSelfAuthor = user && (user.id === author.id || user.username === author.username);
  const isFollowing = Boolean(user?.followingUserIds?.includes(author.id));
  const bookmarked = postId ? isBookmarked(postId) : false;

  // Record reading activity to user history on open
  useEffect(() => {
    if (postId) {
      LibraryService.recordHistory(postId);
    }
  }, [postId]);

  const handleToggleBookmark = async () => {
    if (!postId) return;
    await toggleBookmark(postId);
    const nextState = !bookmarked;
    setBookmarkSuccessToast(nextState ? 'Saved to bookmarks!' : 'Removed from bookmarks');
    setTimeout(() => setBookmarkSuccessToast(null), 2500);
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
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
        <Image
          src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
          alt={author.name}
          width={44}
          height={44}
          className="rounded-full ring-2 ring-emerald-500/20 object-cover shrink-0"
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
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
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
