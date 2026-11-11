'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Share2, MessageSquare } from 'lucide-react';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useClapPostMutation } from '@/hooks/queries';
import { MediumClapButton } from '@/components/ui/clap-icon';
import { redirectToLogin, isUnauthorizedError } from '@/lib/auth-redirect';

interface ReactionBarProps {
  postId: string;
  initialClaps: number;
  commentsCount: number;
  onScrollToComments?: () => void;
  unlockToken?: string;
}

export function ReactionBar({
  postId,
  initialClaps,
  commentsCount,
  onScrollToComments,
  unlockToken,
}: ReactionBarProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const clapMutation = useClapPostMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthState = mounted && isAuthenticated && Boolean(user);
  const saved = showAuthState && isBookmarked(postId);

  const handleClap = async () => {
    if (!isAuthenticated || !user) {
      redirectToLogin();
      throw new Error('LOGIN_REQUIRED');
    }
    try {
      await clapMutation.mutateAsync({ id: postId, unlockToken });
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToLogin();
      }
      throw err;
    }
  };

  const handleBookmarkClick = async () => {
    if (!isAuthenticated || !user) {
      redirectToLogin();
      return;
    }
    try {
      await toggleBookmark(postId, unlockToken);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToLogin();
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-6 rounded-full bg-card border border-border/80 my-8 shadow-xs">
      <div className="flex items-center gap-4">
        <MediumClapButton
          clapsCount={initialClaps}
          onClap={handleClap}
          onRequireAuth={!showAuthState ? () => redirectToLogin() : undefined}
          hideCount={!showAuthState}
          size="md"
          circular={true}
        />

        <button
          type="button"
          onClick={onScrollToComments}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Copy Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleBookmarkClick}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={saved ? 'Remove bookmark' : 'Bookmark'}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark story'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary text-primary' : ''}`} />
        </button>

        <AnimatePresence>
          {showCopied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-10 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md shadow-md"
            >
              Link Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
