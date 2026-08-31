'use client';

import React, { useRef, useState } from 'react';
import { Check, X, Link2, Bold, Italic } from 'lucide-react';

interface ResponseInputProps {
  placeholder?: string;
  onSubmit: (htmlContent: string) => void;
  onCancel?: () => void;
  replyingToName?: string;
}

export function ResponseInput({
  placeholder = 'What are your thoughts?',
  onSubmit,
  onCancel,
  replyingToName,
}: ResponseInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Inline Link Input Bar State
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRef = useRef<Range | null>(null);

  const handleInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText.trim();
      setIsEmpty(text.length === 0);
    }
  };

  const execFormat = (command: string, value: string = '') => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const handleOpenLinkInput = () => {
    // Save active text selection
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    setShowLinkInput(true);
    setLinkUrl('');
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkInput(false);
      return;
    }

    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      // Restore selection
      const sel = window.getSelection();
      if (sel && savedSelectionRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }

      document.execCommand('createLink', false, url);
      // Style anchor tags with link styles
      const links = editorRef.current.querySelectorAll('a');
      links.forEach((a) => {
        a.setAttribute('title', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.className =
          'text-emerald-600 dark:text-emerald-400 underline underline-offset-2 decoration-emerald-500/40 font-medium transition-colors hover:text-emerald-500 break-all';
      });

      handleInput();
    }

    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleCancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorRef.current || isEmpty) return;

    const htmlContent = editorRef.current.innerHTML;
    onSubmit(htmlContent);

    editorRef.current.innerHTML = '';
    setIsEmpty(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 font-sans shadow-xs focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/15 transition-all"
    >
      {replyingToName && (
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
          Replying to @{replyingToName}
        </span>
      )}

      {/* Visual ContentEditable Area */}
      <div className="relative min-h-[80px]">
        {isEmpty && (
          <div className="absolute top-0 left-0 text-xs text-muted-foreground/60 pointer-events-none select-none">
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full min-h-[80px] outline-none text-xs text-foreground font-sans leading-relaxed break-words [overflow-wrap:anywhere]"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      {/* Bottom Bar: Link Input Mode or Standard Tools */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        {showLinkInput ? (
          /* Inline Link Input Bar */
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLink();
                }
                if (e.key === 'Escape') {
                  handleCancelLink();
                }
              }}
              placeholder="Paste or type a URL..."
              className="w-full bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 font-sans focus:border-emerald-500/60"
              autoFocus
            />

            <button
              type="button"
              onClick={handleApplyLink}
              className="p-1.5 hover:bg-muted rounded-lg text-emerald-600 hover:text-emerald-500 cursor-pointer transition-colors"
              title="Apply link"
            >
              <Check className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCancelLink}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Cancel link"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Standard Formatting Tools */
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execFormat('bold');
              }}
              className="hover:text-foreground font-bold text-xs cursor-pointer px-2 py-1 rounded-md hover:bg-muted transition-colors"
              title="Bold"
            >
              B
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execFormat('italic');
              }}
              className="hover:text-foreground italic text-xs cursor-pointer px-2 py-1 rounded-md hover:bg-muted transition-colors"
              title="Italic"
            >
              I
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkInput();
              }}
              className="hover:text-foreground text-xs cursor-pointer p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Add Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isEmpty}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isEmpty
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                : 'bg-muted text-muted-foreground/50 cursor-not-allowed border border-border/40'
            }`}
          >
            Respond
          </button>
        </div>
      </div>
    </form>
  );
}
