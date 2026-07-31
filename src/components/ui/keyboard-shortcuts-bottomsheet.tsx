'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  title: string;
  description?: string;
}

const SHORTCUT_PAGES: Array<ShortcutItem[]> = [
  [
    { keys: ['⌘', 'Alt', '1'], title: 'Bigger header or title' },
    { keys: ['⌘', 'Alt', '2'], title: 'Smaller header or subtitle' },
    { keys: ['⌘', 'Alt', '5'], title: 'Quote', description: 'Two styles of quotes' },
    { keys: ['⌘', 'Alt', '6'], title: 'Code block', description: 'Turn highlighted text into code block' },
    { keys: ['*', 'Space'], title: 'Bulleted list' },
    { keys: ['1', '.', 'Space'], title: 'Ordered list' },
    { keys: ['⌘', 'B'], title: 'Bold' },
    { keys: ['⌘', 'I'], title: 'Italic' },
    { keys: ['⌘', 'K'], title: 'Turn into a link', description: 'Works for text and images' },
  ],
  [
    { keys: ['⌘', 'Z'], title: 'Undo' },
    { keys: ['⌘', 'Shift', 'Z'], title: 'Redo' },
    { keys: ['⌘', 'Shift', '?'], title: 'Open keyboard shortcuts' },
    { keys: ['`', '`', '`'], title: 'Code block' },
    { keys: ['`'], title: 'Inline code' },
    { keys: ['>'], title: 'Blockquote' },
    { keys: ['-', '-', '-'], title: 'Part divider line' },
  ],
];

interface KeyboardShortcutsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsBottomSheet({ isOpen, onClose }: KeyboardShortcutsBottomSheetProps) {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '?' || e.code === 'Slash' || e.key === '/')) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          window.dispatchEvent(new CustomEvent('toggle-shortcuts-bottomsheet'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border/80 p-6 md:p-8 shadow-2xl pointer-events-auto backdrop-blur-md font-sans"
          >
            <div className="max-w-4xl mx-auto space-y-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Keyboard shortcuts
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer absolute right-0 top-0"
                  aria-label="Close shortcuts"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slider Content */}
              <div className="relative flex items-center justify-between gap-4 py-2">
                {/* Left Arrow */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Shortcuts Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                  {SHORTCUT_PAGES[currentPage].map((sc, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-card border border-border/60">
                      <div className="flex items-center gap-1.5">
                        {sc.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd className="px-2 py-1 text-xs font-semibold font-mono bg-muted text-foreground rounded-lg border border-border/80 shadow-xs">
                              {k}
                            </kbd>
                            {kIdx < sc.keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-foreground block">{sc.title}</span>
                        {sc.description && (
                          <span className="text-[10px] text-muted-foreground block">{sc.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(SHORTCUT_PAGES.length - 1, prev + 1))}
                  disabled={currentPage === SHORTCUT_PAGES.length - 1}
                  className="p-2 rounded-full hover:bg-muted disabled:opacity-30 disabled:pointer-events-none text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Page Indicator Dots */}
              <div className="flex justify-center items-center gap-1.5 pt-2">
                {SHORTCUT_PAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      currentPage === idx ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
