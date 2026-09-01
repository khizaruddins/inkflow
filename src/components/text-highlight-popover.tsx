'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, BookmarkCheck, Edit3, X, Check } from 'lucide-react';
import { useHighlightStore } from '@/store/use-highlight-store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface TextHighlightPopoverProps {
  postId: string;
  postTitle: string;
  postSlug: string;
}

export function TextHighlightPopover({ postId, postTitle, postSlug }: TextHighlightPopoverProps) {
  const { addHighlight } = useHighlightStore();
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Note Modal State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!showNoteModal) {
          setPosition(null);
          setSelectedText('');
        }
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length < 3) {
        if (!showNoteModal) {
          setPosition(null);
          setSelectedText('');
        }
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.nodeType === 1 
        ? (range.commonAncestorContainer as HTMLElement) 
        : range.commonAncestorContainer.parentElement;

      // Restrict highlighting ONLY to article body (allow prose, article-content, prose-content)
      const isInsideArticleContent =
        container?.closest('.prose-content') ||
        container?.closest('.prose') ||
        container?.closest('.article-content') ||
        container?.closest('.article-body') ||
        container?.closest('.ProseMirror');

      const isInsideTitle = container?.closest('h1') || container?.closest('.article-title');

      if (!isInsideArticleContent || isInsideTitle) {
        if (!showNoteModal) {
          setPosition(null);
          setSelectedText('');
        }
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
  }, [showNoteModal]);

  const handleQuickHighlight = () => {
    addHighlight(postId, postTitle, postSlug, selectedText);
    setPosition(null);
    setSuccessToast('Highlight saved to Library!');
    setTimeout(() => {
      setSuccessToast(null);
      setSelectedText('');
    }, 2500);
  };

  const handleOpenNoteModal = () => {
    setNoteTitle('');
    setNoteDescription('');
    setShowNoteModal(true);
  };

  const handleSaveNoteHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    addHighlight(postId, postTitle, postSlug, selectedText, noteTitle, noteDescription);
    setShowNoteModal(false);
    setPosition(null);
    setSuccessToast('Highlight & Note saved to Library!');
    setTimeout(() => {
      setSuccessToast(null);
      setSelectedText('');
    }, 2500);
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
    <>
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 font-sans text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Floating Highlight Toolbar */}
      <AnimatePresence>
        {position && selectedText && !showNoteModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            className="fixed -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900 text-slate-100 p-1.5 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md font-sans text-xs"
          >
            {/* Quick Highlight Button */}
            <button
              onClick={handleQuickHighlight}
              className="p-2 rounded-xl hover:bg-slate-800 text-emerald-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Quick Highlight"
            >
              <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] font-bold">H</span>
              Highlight
            </button>

            <div className="h-4 w-px bg-slate-700 my-auto" />

            {/* Highlight with Note Button */}
            <button
              onClick={handleOpenNoteModal}
              className="p-2 rounded-xl hover:bg-slate-800 text-amber-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Add Note & Highlight"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Add Note
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
        )}
      </AnimatePresence>

      {/* Highlight & Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Highlighted Note"
      >
        <form onSubmit={handleSaveNoteHighlight} className="space-y-4 font-sans text-left">
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/70 text-xs italic font-serif text-foreground/90 border-l-4 border-l-emerald-500">
            "{selectedText}"
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Note Name / Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Architecture Insight, Key Takeaway"
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description / Notes</label>
            <textarea
              value={noteDescription}
              onChange={(e) => setNoteDescription(e.target.value)}
              rows={3}
              placeholder="Write your personal reflections or commentary..."
              className="w-full p-2.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" className="rounded-full px-5">
              Save to Highlights
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
