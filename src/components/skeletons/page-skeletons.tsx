'use client';

import React from 'react';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/skeleton';

/* ============================================================================
   Shared Card & Section Skeletons
   ============================================================================ */

export function NavbarActionsSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <Skeleton variant="pill" className="hidden sm:block w-24 h-8" />
      <SkeletonCircle size={32} />
      <SkeletonCircle size={36} />
    </div>
  );
}

export function FooterSectionSkeleton() {
  return (
    <div aria-hidden="true" className="w-full py-10 border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="w-24 h-5 rounded-md" />
        </div>
        <div className="flex items-center gap-5">
          <Skeleton className="w-12 h-3.5" />
          <Skeleton className="w-14 h-3.5" />
          <Skeleton className="w-12 h-3.5" />
          <Skeleton className="w-20 h-3.5" />
        </div>
        <Skeleton className="w-44 h-3.5" />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col space-y-4">
      <Skeleton className="w-full aspect-[16/10] rounded-xl" />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="pill" className="w-20 h-5" />
          <Skeleton className="w-14 h-3.5" />
        </div>
        <Skeleton className="w-full h-6 rounded-md" />
        <Skeleton className="w-4/5 h-6 rounded-md" />
        <SkeletonText lines={2} lastLineWidth="76%" />
        <div className="flex items-center gap-2.5 pt-2">
          <SkeletonCircle size={28} />
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-3.5" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeedPostRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="py-7 border-b border-border/50 flex items-start justify-between gap-6"
    >
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonCircle size={24} />
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="w-11/12 h-6 rounded-md" />
        <Skeleton className="w-3/4 h-6 rounded-md" />
        <SkeletonText lines={2} lastLineWidth="60%" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Skeleton variant="pill" className="w-16 h-5" />
            <Skeleton className="w-14 h-3.5" />
            <Skeleton className="w-10 h-3.5" />
          </div>
          <SkeletonCircle size={24} />
        </div>
      </div>
      <Skeleton className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg shrink-0" />
    </div>
  );
}

export function HeroArticleSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <Skeleton className="lg:col-span-7 aspect-[16/10] w-full rounded-2xl" />
      <div className="lg:col-span-5 space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton variant="pill" className="w-24 h-6" />
          <Skeleton className="w-20 h-4" />
        </div>
        <Skeleton className="w-full h-9 rounded-lg" />
        <Skeleton className="w-4/5 h-9 rounded-lg" />
        <SkeletonText lines={3} lastLineWidth="70%" />
        <div className="flex items-center gap-3 pt-2">
          <SkeletonCircle size={40} />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <SkeletonCircle size={44} />
        <div className="space-y-2 min-w-0">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-48 max-w-full h-3" />
        </div>
      </div>
      <Skeleton variant="pill" className="w-20 h-8 shrink-0" />
    </div>
  );
}

export function UserListModalSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-3 min-w-0">
            <SkeletonCircle size={40} />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="w-40 h-3" />
            </div>
          </div>
          <Skeleton variant="pill" className="w-20 h-7 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="p-4 rounded-xl border border-border/40 flex items-start gap-4"
    >
      <SkeletonCircle size={40} />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3.5" />
        <Skeleton className="w-24 h-3" />
      </div>
      <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" />
    </div>
  );
}

/* ============================================================================
   Page-Level Skeletons (Used in both loading.tsx & client loading states)
   ============================================================================ */

export function HomePageSkeleton({ mode = 'feed' }: { mode?: 'guest' | 'feed' }) {
  if (mode === 'guest') {
    return (
      <div aria-hidden="true" className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-background">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <Skeleton className="w-full max-w-xl h-14 sm:h-16 rounded-xl" />
            <Skeleton className="w-4/5 max-w-md h-14 sm:h-16 rounded-xl" />
            <SkeletonText lines={2} lineClassName="h-5" lastLineWidth="78%" />
            <Skeleton variant="pill" className="w-44 h-12" />
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Skeleton className="w-full max-w-[440px] aspect-square rounded-2xl" />
          </div>
        </div>
        <div className="border-t border-border/60 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-3.5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="hidden lg:block lg:col-span-2 space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
          <div className="pt-6 border-t border-border/40 space-y-2.5 px-3">
            <Skeleton className="w-28 h-3.5" />
            <div className="flex items-center gap-2.5 py-1.5">
              <SkeletonCircle size={24} />
              <Skeleton className="w-24 h-3.5" />
            </div>
            <div className="flex items-center gap-2.5 py-1.5">
              <SkeletonCircle size={24} />
              <Skeleton className="w-20 h-3.5" />
            </div>
          </div>
        </aside>

        {/* Center Main Feed */}
        <div className="lg:col-span-7 border-x border-border/30 px-0 sm:px-6">
          <div className="flex items-center gap-6 pb-4 border-b border-border/40">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-20 h-5" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <FeedPostRowSkeleton key={i} />
          ))}
        </div>

        {/* Right Rail */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 pt-2">
          <div className="space-y-4">
            <Skeleton className="w-28 h-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 py-2">
                <div className="flex items-center gap-2">
                  <SkeletonCircle size={20} />
                  <Skeleton className="w-24 h-3" />
                </div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Skeleton className="w-36 h-4" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="pill" className="w-20 h-8" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="w-32 h-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <SkeletonCircle size={36} />
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-3.5" />
                    <Skeleton className="w-28 h-3" />
                  </div>
                </div>
                <Skeleton variant="pill" className="w-16 h-7" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BlogPageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-12 space-y-6">
        <Skeleton className="w-64 h-10 rounded-lg" />
        <SkeletonText lines={2} className="max-w-2xl" lastLineWidth="75%" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border/50 space-y-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-3/4 h-5" />
              <SkeletonText lines={2} lastLineWidth="82%" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-24 rounded-2xl" />
        <div className="flex flex-wrap gap-2.5 pt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="pill" className="w-24 h-8" />
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16">
        <PostCardGridSkeleton count={6} />
      </section>
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Skeleton className="w-32 h-5" />
      </div>

      <article className="max-w-3xl mx-auto px-6 pt-8">
        <header className="space-y-6 mb-10">
          <div className="flex items-center gap-3">
            <Skeleton variant="pill" className="w-24 h-6" />
            <Skeleton variant="pill" className="w-28 h-6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="w-full h-11 rounded-lg" />
            <Skeleton className="w-4/5 h-11 rounded-lg" />
          </div>
          <Skeleton className="w-3/4 h-6 rounded-md" />
          <div className="pt-2 border-y border-border/40 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SkeletonCircle size={44} />
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-40 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Skeleton variant="pill" className="w-20 h-8" />
              <SkeletonCircle size={32} />
            </div>
          </div>
        </header>

        <Skeleton className="w-full aspect-[16/9] rounded-2xl mb-12" />

        <div className="space-y-7">
          <SkeletonText lines={5} lineClassName="h-4" lastLineWidth="78%" />
          <Skeleton className="w-2/3 h-7 rounded-md" />
          <SkeletonText lines={4} lineClassName="h-4" lastLineWidth="85%" />
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          <SkeletonText lines={5} lineClassName="h-4" lastLineWidth="64%" />
        </div>

        <div className="my-12 p-6 rounded-2xl border border-border/50 flex items-center gap-4">
          <SkeletonCircle size={56} />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-40 h-5" />
            <SkeletonText lines={2} lastLineWidth="72%" />
          </div>
          <Skeleton variant="pill" className="w-24 h-9" />
        </div>
      </article>

      <section className="max-w-3xl mx-auto px-6 pt-10 border-t border-border/50 space-y-6">
        <Skeleton className="w-44 h-7 rounded-md" />
        <Skeleton className="w-full h-28 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border/40 space-y-3">
            <div className="flex items-center gap-2.5">
              <SkeletonCircle size={32} />
              <Skeleton className="w-28 h-4" />
            </div>
            <SkeletonText lines={2} lastLineWidth="60%" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function CategoryPageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-10">
        <div className="space-y-3 border-b border-border/50 pb-8">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-64 h-11 rounded-lg" />
          <Skeleton className="w-96 max-w-full h-5" />
        </div>
        <PostCardGridSkeleton count={6} />
      </div>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      <div className="space-y-4">
        <Skeleton className="w-full max-w-2xl h-12 rounded-xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="pill" className="w-24 h-8" />
          ))}
        </div>
        <Skeleton className="w-48 h-4" />
      </div>
      <PostCardGridSkeleton count={6} />
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SkeletonCircle size={64} className="lg:hidden" />
                <div className="space-y-2">
                  <Skeleton className="w-48 h-9 rounded-lg" />
                  <Skeleton className="w-32 h-4" />
                </div>
              </div>
              <Skeleton variant="pill" className="w-24 h-9" />
            </div>

            <div className="flex items-center gap-6 border-b border-border/50 pb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-5" />
              ))}
            </div>

            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedPostRowSkeleton key={i} />
              ))}
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-4 border-l border-border/40 pl-8 space-y-6">
            <SkeletonCircle size={88} />
            <div className="space-y-2">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-28 h-3.5" />
              <SkeletonText lines={3} lastLineWidth="70%" />
            </div>
            <Skeleton variant="pill" className="w-28 h-9" />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function LibraryPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="w-44 h-10 rounded-lg" />
        <Skeleton variant="pill" className="w-28 h-9" />
      </div>

      <div className="flex items-center gap-6 border-b border-border/50 pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-5" />
        ))}
      </div>

      <Skeleton className="w-full h-36 rounded-2xl" />

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-border/50 flex flex-col sm:flex-row justify-between gap-6"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <SkeletonCircle size={24} />
                <Skeleton className="w-28 h-3.5" />
              </div>
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <Skeleton className="w-24 h-24 rounded-lg hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListDetailPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Skeleton className="w-32 h-5" />
      <div className="space-y-3 pb-6 border-b border-border/50">
        <Skeleton className="w-72 h-9 rounded-lg" />
        <SkeletonText lines={2} className="max-w-xl" lastLineWidth="60%" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <FeedPostRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-44 h-9 rounded-lg" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton variant="pill" className="w-32 h-9" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="w-40 h-9 rounded-lg" />
        <Skeleton className="w-72 h-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-11 rounded-xl" />
          ))}
        </div>
        <div className="md:col-span-8 p-6 rounded-2xl border border-border/50 space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonCircle size={72} />
            <div className="space-y-2 flex-1">
              <Skeleton className="w-36 h-4" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-full h-11 rounded-lg" />
            </div>
          ))}
          <Skeleton className="w-full h-24 rounded-lg" />
          <div className="flex justify-end">
            <Skeleton variant="pill" className="w-32 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BecomeCreatorPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <Skeleton variant="pill" className="w-36 h-6 mx-auto" />
        <Skeleton className="w-80 max-w-full h-10 mx-auto rounded-lg" />
        <SkeletonText lines={2} className="max-w-lg mx-auto" lastLineWidth="70%" />
      </div>
      <div className="p-8 rounded-2xl border border-border/50 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-40 h-4" />
            <Skeleton className={i === 2 ? 'w-full h-28 rounded-xl' : 'w-full h-11 rounded-xl'} />
          </div>
        ))}
        <Skeleton variant="pill" className="w-full h-12" />
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative p-12 bg-muted/20">
        <Skeleton className="w-full h-full min-h-[600px] rounded-2xl" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <Skeleton className="w-32 h-7 mx-auto rounded-md" />
            <Skeleton className="w-56 h-4 mx-auto" />
          </div>
          <div className="space-y-4 p-6 rounded-2xl border border-border/50">
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton variant="pill" className="w-full h-11" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaticPageSkeleton() {
  return (
    <div aria-hidden="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-4">
        <Skeleton variant="pill" className="w-28 h-6" />
        <Skeleton className="w-3/4 h-12 rounded-xl" />
        <SkeletonText lines={3} lastLineWidth="78%" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/50 space-y-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-40 h-5" />
            <SkeletonText lines={3} lastLineWidth="72%" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   Dashboard & Editor Skeletons
   ============================================================================ */

export function StatsOverviewSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-20 h-8 rounded-md" />
          <Skeleton className="w-32 h-3.5" />
        </div>
      ))}
    </div>
  );
}

export function DataTableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="w-full sm:w-80 h-10 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-9 rounded-lg" />
          <Skeleton className="w-24 h-9 rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1 max-w-[140px]" />
          ))}
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="px-4 py-4 flex items-center gap-4">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton
                  key={c}
                  className={c === 0 ? 'h-4 flex-[2] max-w-[260px]' : 'h-4 flex-1 max-w-[120px]'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-56 h-8 rounded-lg" />
          <Skeleton className="w-80 h-4" />
        </div>
        <Skeleton variant="pill" className="w-36 h-10" />
      </div>
      <StatsOverviewSkeleton cards={4} />
      <DataTableSkeleton rows={6} columns={5} />
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <Skeleton className="w-72 h-4" />
      </div>
      <StatsOverviewSkeleton cards={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="w-full h-72 rounded-2xl" />
        <Skeleton className="w-full h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function ApplicationsPageSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-xl border border-border bg-card flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4 flex-1">
            <SkeletonCircle size={48} />
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="w-36 h-5" />
                <Skeleton variant="pill" className="w-20 h-5" />
              </div>
              <Skeleton className="w-48 h-3.5" />
              <SkeletonText lines={2} lastLineWidth="78%" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton variant="pill" className="w-24 h-9" />
            <Skeleton variant="pill" className="w-24 h-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewQueuePageSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="w-2/3 h-6 rounded-md" />
              <Skeleton className="w-48 h-3.5" />
            </div>
            <Skeleton variant="pill" className="w-24 h-6" />
          </div>
          <SkeletonText lines={2} lastLineWidth="65%" />
          <div className="flex items-center gap-3 pt-2">
            <Skeleton variant="pill" className="w-28 h-9" />
            <Skeleton variant="pill" className="w-28 h-9" />
            <Skeleton variant="pill" className="w-24 h-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaxonomyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="w-28 h-5" />
            <Skeleton className="w-12 h-5 rounded-full" />
          </div>
          <SkeletonText lines={2} lastLineWidth="72%" />
        </div>
      ))}
    </div>
  );
}

export function EditorPageSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-screen bg-background flex flex-col">
      {/* Top Editor Navbar Skeleton */}
      <div className="h-16 px-6 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-28 h-4" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="pill" className="w-24 h-9" />
          <Skeleton variant="pill" className="w-24 h-9" />
          <SkeletonCircle size={32} />
        </div>
      </div>

      {/* Editor Canvas Skeleton */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-6">
        <Skeleton className="w-3/4 h-12 rounded-xl" />
        <Skeleton className="w-1/2 h-6 rounded-md" />
        <Skeleton className="w-full h-11 rounded-xl" />
        <div className="space-y-4 pt-4">
          <SkeletonText lines={4} lineClassName="h-4" lastLineWidth="74%" />
          <Skeleton className="w-full aspect-[16/9] rounded-xl" />
          <SkeletonText lines={5} lineClassName="h-4" lastLineWidth="82%" />
        </div>
      </div>
    </div>
  );
}

export function UnsplashGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[16/10] w-full rounded-lg" />
      ))}
    </div>
  );
}

