'use client';

import React, { useEffect, useRef } from 'react';
import { BlogService } from '@/services/blog.service';

interface ArticleReadTrackerProps {
  postId: string;
  wordCount?: number;
  shareToken?: string;
  unlockToken?: string;
  onViewRecorded?: (viewsCount: number) => void;
}

/**
 * Counts a verified read view (for both guests and logged-in users) only after:
 * 1) Active visible reading time meets 2x fastest average reading speed (~500 WPM, min 4s), AND
 * 2) Reader scrolls down to the finish-line sentinel at the end of the article body.
 */
export function ArticleReadTracker({
  postId,
  wordCount,
  shareToken,
  unlockToken,
  onViewRecorded,
}: ArticleReadTrackerProps) {
  const finishLineRef = useRef<HTMLDivElement | null>(null);
  const reachedBottomRef = useRef(false);
  const accumulatedVisibleMsRef = useRef(0);
  const lastVisibleStartRef = useRef<number | null>(null);
  const recordedRef = useRef(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    reachedBottomRef.current = false;
    accumulatedVisibleMsRef.current = 0;
    lastVisibleStartRef.current =
      typeof document !== 'undefined' && document.visibilityState === 'visible'
        ? Date.now()
        : null;
    recordedRef.current = false;
    sendingRef.current = false;

    const effectiveWords = Math.max(wordCount || 0, 25);
    // Fastest average reader at 2x speed (~500 WPM), minimum 4 seconds for very short posts
    const requiredMs = Math.max(4000, Math.round((effectiveWords / 500) * 60 * 1000));

    const getElapsedVisibleMs = () => {
      const ongoing =
        lastVisibleStartRef.current !== null ? Date.now() - lastVisibleStartRef.current : 0;
      return accumulatedVisibleMsRef.current + Math.max(0, ongoing);
    };

    const trySubmitView = async () => {
      if (recordedRef.current || sendingRef.current || !postId) return;
      const elapsedMs = getElapsedVisibleMs();
      if (!reachedBottomRef.current || elapsedMs < requiredMs) return;

      sendingRef.current = true;
      try {
        const res = await BlogService.recordView(postId, {
          readDurationMs: elapsedMs,
          reachedBottom: true,
          wordCount: effectiveWords,
          shareToken,
          unlockToken,
        });

        if (res.counted) {
          recordedRef.current = true;
          onViewRecorded?.(res.viewsCount);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('inkflow:view-recorded', {
                detail: { postId, viewsCount: res.viewsCount },
              })
            );
          }
        }
      } catch {
        // Silent retry on next check if transient network error occurs
      } finally {
        sendingRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (lastVisibleStartRef.current === null) {
          lastVisibleStartRef.current = Date.now();
        }
        trySubmitView();
      } else if (lastVisibleStartRef.current !== null) {
        accumulatedVisibleMsRef.current += Math.max(0, Date.now() - lastVisibleStartRef.current);
        lastVisibleStartRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    const targetEl = finishLineRef.current;

    const checkScrollBottomFallback = () => {
      if (!targetEl || reachedBottomRef.current) return;
      const rect = targetEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 40) {
        reachedBottomRef.current = true;
        trySubmitView();
      }
    };

    if (targetEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              reachedBottomRef.current = true;
              trySubmitView();
            }
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(targetEl);
    }

    window.addEventListener('scroll', checkScrollBottomFallback, { passive: true });
    checkScrollBottomFallback();

    const intervalId = window.setInterval(() => {
      if (!recordedRef.current) {
        checkScrollBottomFallback();
        trySubmitView();
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', checkScrollBottomFallback);
      if (observer) observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, [postId, wordCount, shareToken, unlockToken, onViewRecorded]);

  return (
    <div
      ref={finishLineRef}
      data-testid="article-finish-line"
      aria-hidden="true"
      className="h-2 w-full"
    />
  );
}
