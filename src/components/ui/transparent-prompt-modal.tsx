'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransparentPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  subtitle?: string;
  imageSrc?: string | null;
  placeholder?: string;
  initialValue?: string;
}

export function TransparentPromptModal({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  imageSrc,
  placeholder = 'Type here...',
  initialValue = '',
}: TransparentPromptModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Semi-Transparent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-md"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative z-50 w-full max-w-xl text-center space-y-6 font-sans"
          >
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Optional Image Thumbnail Preview */}
            {imageSrc && (
              <div className="relative aspect-[16/10] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSave} className="space-y-6 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 text-sm text-center bg-card border border-border/80 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full border border-border text-muted-foreground hover:text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
