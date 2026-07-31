'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Share2, MessageSquare, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useClapPostMutation } from '@/hooks/queries';
import { formatNumber } from '@/lib/utils';

interface ReactionBarProps {
  postId: string;
  initialClaps: number;
  commentsCount: number;
  onScrollToComments?: () => void;
}

export function ReactionBar({ postId, initialClaps, commentsCount, onScrollToComments }: ReactionBarProps) {
  const { user } = useAuthStore();
  const [claps, setClaps] = useState(initialClaps);
  const [hasClapped, setHasClapped] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const saved = isBookmarked(postId);
  const clapMutation = useClapPostMutation();

  const handleClap = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#0284c7', '#a855f7', '#10b981'],
    });

    setClaps((prev) => prev + 1);
    setHasClapped(true);
    clapMutation.mutate({ id: postId });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-6 rounded-full bg-card border border-border/80 my-8">
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.85, rotate: -8 }}
          whileHover={{ scale: 1.08 }}
          onClick={handleClap}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm cursor-pointer transition-colors"
        >
          <Heart className={`w-4 h-4 ${hasClapped ? 'fill-primary' : ''}`} />
          <span>{formatNumber(claps)}</span>
        </motion.button>

        <button
          onClick={onScrollToComments}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount} Comments</span>
        </button>
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Copy Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => toggleBookmark(postId)}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Bookmark"
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
