'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ClapIconProps {
  className?: string;
  filled?: boolean;
}

/**
 * Raising Hands Emoji Icon 🙌
 */
export function ClapIcon({ className = 'text-base', filled = false }: ClapIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center leading-none select-none transition-transform ${className}`}
      role="img"
      aria-label="raising hands"
    >
      🙌
    </span>
  );
}

interface MediumClapButtonProps {
  clapsCount: number;
  userClaps?: number;
  onClap: (newTotalClaps: number, addedClaps: number) => Promise<void> | void;
  disabled?: boolean;
  disabledTooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  circular?: boolean;
}

/**
 * Interactive Clapping Button with Raising Hands Emoji 🙌 and Floating "+N" Badge
 */
export function MediumClapButton({
  clapsCount: initialClapsCount,
  userClaps: initialUserClaps = 0,
  onClap,
  disabled = false,
  disabledTooltip,
  size = 'md',
  showCount = true,
  circular = false,
}: MediumClapButtonProps) {
  const [totalClaps, setTotalClaps] = useState(initialClapsCount);
  const [myClaps, setMyClaps] = useState(initialUserClaps);
  const [showBadge, setShowBadge] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isClapping, setIsClapping] = useState(false);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTotalClaps(initialClapsCount);
  }, [initialClapsCount]);

  useEffect(() => {
    setMyClaps(initialUserClaps);
  }, [initialUserClaps]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Trigger micro confetti burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 18,
      spread: 50,
      origin: { x, y },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      ticks: 120,
    });

    const newMyClaps = myClaps + 1;
    const newTotalClaps = totalClaps + 1;

    setMyClaps(newMyClaps);
    setTotalClaps(newTotalClaps);
    setIsClapping(true);
    setShowBadge(true);
    setShowTooltip(false);

    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowBadge(false);
      setIsClapping(false);
    }, 1400);

    onClap(newTotalClaps, newMyClaps);
  };

  const emojiSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Floating Emerald "+N" Badge Bubble */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -38, scale: 1 }}
            exit={{ opacity: 0, y: -48, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 z-50 pointer-events-none"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-xl ring-2 ring-background">
              +{myClaps}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Total Claps Tooltip */}
      <AnimatePresence>
        {showTooltip && !showBadge && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 z-40 pointer-events-none whitespace-nowrap"
          >
            <div className="relative bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg">
              {disabled && disabledTooltip ? disabledTooltip : `${totalClaps} claps`}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Clap Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileTap={!disabled ? { scale: 0.85, rotate: -8 } : undefined}
        disabled={disabled}
        className={`group flex items-center gap-1.5 transition-all cursor-pointer select-none focus:outline-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed text-muted-foreground'
            : myClaps > 0
            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <motion.div
          animate={isClapping ? { scale: [1, 1.3, 0.95, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.35 }}
          className={`flex items-center justify-center rounded-full transition-all ${
            circular ? containerSizes[size] : 'p-0.5'
          } ${
            circular
              ? myClaps > 0
                ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-xs'
                : 'border border-border/80 group-hover:border-emerald-500/70 bg-card hover:bg-emerald-500/5'
              : ''
          }`}
        >
          <ClapIcon
            className={emojiSizes[size]}
            filled={myClaps > 0}
          />
        </motion.div>

        {showCount && (
          <span className="text-xs font-semibold font-sans transition-colors">
            {totalClaps}
          </span>
        )}
      </motion.button>
    </div>
  );
}
