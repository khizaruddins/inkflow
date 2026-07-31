'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HighlightingIcon, MessageSquare, Share2 } from 'lucide-react';
import { useHighlightStore } from '@/store/use-highlight-store';

interface TextHighlightPopoverProps {
  postId: string;
  postTitle: string;
  postSlug: string;
}

export function TextHighlightPopover({ postId, postTitle, postSlug }: TextHighlightPopoverProps) {
  const { addHighlight } = useHighlightStore();
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 3) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.nodeType === 1 
        ? (range.commonAncestorContainer as HTMLElement) 
        : range.commonAncestorContainer.parentElement;

      // Restrict highlighting ONLY to blog content body (not blog title or headings)
      const isInsideArticleContent = container?.closest('.prose-content') || container?.closest('.ProseMirror');
      const isInsideTitle = container?.closest('h1') || container?.closest('.article-title');

      if (!isInsideArticleContent || isInsideTitle) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setPosition({
        top: window.scrollY + rect.top - 50,
        left: rect.left + rect.width / 2,
      });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (!position || !selectedText) return null;

  const handleHighlight = () => {
    addHighlight(postId, postTitle, postSlug, selectedText);
    setPosition(null);
    setSelectedText('');
  };

  const handleRespond = () => {
    const commentBox = document.querySelector('textarea[placeholder*="thoughts"]');
    if (commentBox) {
      commentBox.scrollIntoView({ behavior: 'smooth' });
      (commentBox as HTMLTextAreaElement).focus();
      (commentBox as HTMLTextAreaElement).value = `"${selectedText}"\n\n`;
    }
    setPosition(null);
  };

  const handleShareX = () => {
    const text = `"${selectedText}" - via ${postTitle}`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setPosition(null);
  };

  const handleShareLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    setPosition(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        className="fixed -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900 text-slate-100 p-1.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md font-sans text-xs"
      >
        {/* Highlight Button */}
        <button
          onClick={handleHighlight}
          className="p-2 rounded-xl hover:bg-slate-800 text-emerald-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Highlight text"
        >
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] font-bold">H</span>
          Highlight
        </button>

        <div className="h-4 w-px bg-slate-700 my-auto" />

        {/* Respond Button */}
        <button
          onClick={handleRespond}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Respond to this text"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Respond
        </button>

        <div className="h-4 w-px bg-slate-700 my-auto" />

        {/* Share X Button */}
        <button
          onClick={handleShareX}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-200 font-semibold transition-colors cursor-pointer"
          title="Share quote on X"
        >
          𝕏
        </button>

        {/* Share LinkedIn Button */}
        <button
          onClick={handleShareLinkedIn}
          className="p-2 rounded-xl hover:bg-slate-800 text-sky-400 font-semibold transition-colors cursor-pointer"
          title="Share quote on LinkedIn"
        >
          in
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
