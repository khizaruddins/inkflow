'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link2, Check, ExternalLink } from 'lucide-react';

interface ShareDropdownProps {
  url?: string;
  title?: string;
}

export function ShareDropdown({ url, title = 'Check out this article on InkFlow' }: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const shareOnX = () => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(intent, '_blank');
    setIsOpen(false);
  };

  const shareOnFB = () => {
    const intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(intent, '_blank');
    setIsOpen(false);
  };

  const shareOnLinkedIn = () => {
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(intent, '_blank');
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1800);
  };

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Share story"
      >
        <Share2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click outside listener */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden py-1"
            >
              <button
                onClick={shareOnX}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors text-left font-medium"
              >
                <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center font-bold text-xs">𝕏</span>
                Share on X
              </button>

              <button
                onClick={shareOnFB}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors text-left font-medium"
              >
                <span className="w-5 h-5 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">f</span>
                Share on Facebook
              </button>

              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors text-left font-medium"
              >
                <span className="w-5 h-5 rounded-md bg-sky-600/10 text-sky-600 flex items-center justify-center font-bold text-xs">in</span>
                Share on LinkedIn
              </button>

              <div className="h-px bg-border my-1" />

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors text-left font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Link copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    Copy link
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
