'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Share2, MessageSquare } from 'lucide-react';
import { useBookmarkStore } from '@/store/use-bookmark-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useClapPostMutation } from '@/hooks/queries';
import { MediumClapButton } from '@/components/ui/clap-icon';

interface ReactionBarProps {
  postId: string;
  initialClaps: number;
  commentsCount: number;
  onScrollToComments?: () => void;
}

export function ReactionBar({ postId, initialClaps, commentsCount, onScrollToComments }: ReactionBarProps) {
  const { user } = useAuthStore();
  const [showCopied, setShowCopied] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const saved = isBookmarked(postId);
  const clapMutation = useClapPostMutation();

  const handleClap = async (newTotalClaps: number, _addedClaps: number) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
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
    <div className="flex items-center justify-between py-2 px-6 rounded-full bg-card border border-border/80 my-8 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Medium Clapping Button with Floating Badge */}
        <MediumClapButton
          clapsCount={initialClaps}
          onClap={handleClap}
          size="md"
          circular={true}
        />

        <button
          onClick={onScrollToComments}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount}</span>
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
