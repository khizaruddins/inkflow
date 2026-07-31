'use client';

import React, { useRef, useState } from 'react';
import { Check, X, Link2 } from 'lucide-react';

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
      // Style anchor tags with black underline & title tooltip for hover
      const links = editorRef.current.querySelectorAll('a');
      links.forEach((a) => {
        a.setAttribute('title', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.className = 'text-foreground underline underline-offset-2 decoration-foreground font-medium transition-colors hover:opacity-80';
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
    <form onSubmit={handleSubmit} className="bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl p-4 space-y-4 font-sans border-none shadow-none">
      {replyingToName && (
        <span className="text-[11px] font-semibold text-muted-foreground block">
          Replying to {replyingToName}
        </span>
      )}

      {/* Visual ContentEditable Area */}
      <div className="relative min-h-[90px]">
        {isEmpty && (
          <div className="absolute top-0 left-0 text-xs text-muted-foreground/60 pointer-events-none select-none">
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full min-h-[90px] outline-none text-xs text-foreground font-sans leading-relaxed break-words"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      {/* Bottom Bar: Link Input Mode or Standard Tools */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        {showLinkInput ? (
          /* Inline Link Input Bar (Medium Screenshot Spec) */
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
              placeholder="Type a link..."
              className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/60 font-sans"
              autoFocus
            />

            <button
              type="button"
              onClick={handleApplyLink}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Apply link"
            >
              <Check className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCancelLink}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Cancel link"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Standard Formatting Tools */
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                execFormat('bold');
              }}
              className="hover:text-foreground font-bold text-xs cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
              className="hover:text-foreground italic text-xs cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Italic"
            >
              i
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkInput();
              }}
              className="hover:text-foreground text-xs cursor-pointer p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1 cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isEmpty}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              !isEmpty
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
            }`}
          >
            Respond
          </button>
        </div>
      </div>
    </form>
  );
}
