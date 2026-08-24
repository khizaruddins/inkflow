'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { AuthService } from '@/services/auth.service';
import { LibraryService } from '@/services/library.service';
import { ClapButton } from './clap-button';
import { Author } from '@/types';

interface AuthorHeaderProps {
  author: Author;
  postId?: string;
  readingTimeMinutes?: number;
  publishedAt?: string | null;
  clapsCount?: number;
}

export function AuthorHeader({ author, postId, readingTimeMinutes, publishedAt, clapsCount = 0 }: AuthorHeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSelfAuthor = user && (user.id === author.id || user.username === author.username);

  // Record reading activity to user history on open
  useEffect(() => {
    if (isAuthenticated && postId) {
      LibraryService.recordHistory(postId);
    }
  }, [isAuthenticated, postId]);

  useEffect(() => {
    if (user?.followingUserIds?.includes(author.id)) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  }, [user, author.id]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.toggleFollowUser(author.id);
      setIsFollowing(res.following);
      if (user) {
        useAuthStore.setState({
          user: {
            ...user,
            followingUserIds: res.followingUserIds,
          },
        });
      }
    } catch (err) {
      setIsFollowing((prev) => !prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/60 font-sans">
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

      <div className="flex items-center gap-4">
        {postId && (
          <ClapButton
            postId={postId}
            authorId={author.id}
            initialClapsCount={clapsCount}
          />
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
