'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useLoadingStore } from '@/store/use-loading-store';

/**
 * Mount inside Next.js App Router loading.tsx Suspense fallbacks to signal
 * the top horizontal emerald page loader while a route segment streams/loads.
 */
export function RouteLoadingSignal() {
  useEffect(() => {
    const { startRouteTransition, stopRouteTransition } = useLoadingStore.getState();
    startRouteTransition();
    return () => {
      stopRouteTransition();
    };
  }, []);

  return null;
}

function TopPageLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() || ''}`;

  const activeRequests = useLoadingStore((state) => state.activeRequests);
  const activeRouteTransitions = useLoadingStore((state) => state.activeRouteTransitions);
  const queryFetching = useIsFetching();
  const queryMutating = useIsMutating();

  const [isNavigating, setIsNavigating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const trickleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const navSafetyTimerRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);
  const prevRouteKeyRef = useRef(routeKey);

  const isBusy =
    isNavigating ||
    activeRequests > 0 ||
    activeRouteTransitions > 0 ||
    queryFetching > 0 ||
    queryMutating > 0;

  // Complete navigation state when Next.js commits the new URL
  useEffect(() => {
    if (prevRouteKeyRef.current !== routeKey) {
      prevRouteKeyRef.current = routeKey;
      setIsNavigating(false);
      if (navSafetyTimerRef.current !== null) {
        window.clearTimeout(navSafetyTimerRef.current);
        navSafetyTimerRef.current = null;
      }
    }
  }, [routeKey]);

  // Listen to anchor clicks, browser back/forward, and Next.js router history updates
  useEffect(() => {
    const startNav = () => {
      if (navSafetyTimerRef.current !== null) {
        window.clearTimeout(navSafetyTimerRef.current);
      }
      setIsNavigating(true);
      // Safety cutoff in case route navigation is cancelled or identical
      navSafetyTimerRef.current = window.setTimeout(() => {
        setIsNavigating(false);
      }, 6000);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;
        const currentFull = `${window.location.pathname}${window.location.search}`;
        const nextFull = `${nextUrl.pathname}${nextUrl.search}`;
        if (currentFull !== nextFull) {
          startNav();
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    const handlePopState = () => {
      window.setTimeout(startNav, 0);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const nextUrlArg = args[2];
      if (nextUrlArg) {
        try {
          const nextUrl = new URL(String(nextUrlArg), window.location.href);
          const currentFull = `${window.location.pathname}${window.location.search}`;
          const nextFull = `${nextUrl.pathname}${nextUrl.search}`;
          if (currentFull !== nextFull) {
            window.setTimeout(startNav, 0);
          }
        } catch {}
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      return originalReplaceState.apply(this, args);
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (navSafetyTimerRef.current !== null) {
        window.clearTimeout(navSafetyTimerRef.current);
      }
    };
  }, []);

  // Drive smooth progress progression while busy, then complete to 100 and fade out
  useEffect(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (isBusy) {
      isVisibleRef.current = true;
      setVisible(true);
      setProgress((prev) => (prev <= 0 || prev >= 98 ? 18 : prev));

      if (trickleTimerRef.current === null) {
        trickleTimerRef.current = window.setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return prev;
            const step = prev < 45 ? 12 : prev < 75 ? 6 : 2;
            return Math.min(90, prev + step);
          });
        }, 180);
      }
    } else {
      if (trickleTimerRef.current !== null) {
        window.clearInterval(trickleTimerRef.current);
        trickleTimerRef.current = null;
      }

      if (isVisibleRef.current) {
        setProgress(100);
        hideTimerRef.current = window.setTimeout(() => {
          isVisibleRef.current = false;
          setVisible(false);
          setProgress(0);
        }, 280);
      }
    }

    return () => {
      if (trickleTimerRef.current !== null) {
        window.clearInterval(trickleTimerRef.current);
        trickleTimerRef.current = null;
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isBusy]);

  if (!visible) return null;

  return (
    <progress
      aria-label="Page loading progress"
      max={100}
      value={progress}
      className="inkflow-top-progress"
      style={{ opacity: progress >= 100 && !isBusy ? 0 : 1 }}
    />
  );
}

/**
 * Global thin horizontal emerald green progress indicator fixed at the top of the viewport.
 * Automatically activates on page navigations, Next.js loading.tsx fallbacks, React Query fetches,
 * and axiosClient/fetch API calls.
 */
export function TopPageLoader() {
  return (
    <Suspense fallback={null}>
      <TopPageLoaderInner />
    </Suspense>
  );
}
