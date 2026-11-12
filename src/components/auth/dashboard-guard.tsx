'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Protects all /dashboard/** routes (including /dashboard/posts?tab=shared)
 * by redirecting unauthenticated visitors to /login with the return URL.
 */
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authorized = mounted && !isCheckingAuth && isAuthenticated && Boolean(user);

  useEffect(() => {
    if (!mounted || isCheckingAuth) return;
    if (!isAuthenticated || !user) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const target = `${pathname || '/dashboard'}${search || ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [mounted, isCheckingAuth, isAuthenticated, user, pathname, router]);

  if (!authorized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}
