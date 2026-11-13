'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenSquare, Eye, TrendingUp, Plus, ArrowRight, Flame } from 'lucide-react';
import { AnalyticsService } from '@/services/analytics.service';
import { BlogService } from '@/services/blog.service';
import { useAuthStore } from '@/store/use-auth-store';
import { StatsOverview } from '@/features/dashboard/stats-overview';
import { DashboardHeader } from '@/features/dashboard/dashboard-header';
import { StatsOverviewSkeleton, FeedPostRowSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsSummary, BlogPost } from '@/types';
import { formatDate, formatNumber } from '@/lib/utils';

const EMPTY_STATS: AnalyticsSummary = {
  totalViews: 0,
  viewsTrend: 0,
  totalPublished: 0,
  publishedTrend: 0,
  totalClaps: 0,
  clapsTrend: 0,
  totalSubscribers: 0,
  subscribersTrend: 0,
  readingTimeHours: 0,
  trafficSources: [],
  countryStats: [],
  dailyViews: [],
  topArticles: [],
};

export default function DashboardOverviewPage() {
  const { user, role, isAuthenticated, isCheckingAuth } = useAuthStore();
  const [stats, setStats] = useState<AnalyticsSummary>(EMPTY_STATS);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = String(role || '').toLowerCase() === 'admin';

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      if (isCheckingAuth || !isAuthenticated || !user) return;
      setLoading(true);
      try {
        const [summary, fetchedPosts] = await Promise.all([
          AnalyticsService.getSummary(),
          BlogService.getPosts({
            status: 'all',
            ...(isAdmin ? {} : { authorId: user.id }),
          }),
        ]);
        if (!active) return;
        setStats(summary);
        setPosts(fetchedPosts);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, [isCheckingAuth, isAuthenticated, user, isAdmin]);

  const showSkeleton = isCheckingAuth || loading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-14rem)] font-sans">
      <DashboardHeader />

      {showSkeleton ? <StatsOverviewSkeleton /> : <StatsOverview stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Articles</h2>
            <Link
              href="/dashboard/posts"
              className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              View All Posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {showSkeleton ? (
            <div aria-hidden="true" className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <FeedPostRowSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-10 rounded-3xl bg-card border border-border/80 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <PenSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-foreground">No Published Articles Yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You haven&apos;t published any articles yet. Start sharing your technical insights and system architectures with the InkFlow community.
                </p>
              </div>
              <Link href="/dashboard/posts/new" className="inline-block pt-1">
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-full text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4" /> Start Writing New Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 8).map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                        {post.status.toUpperCase()}
                      </Badge>
                      {post.visibility === 'private' && <Badge variant="warning">PRIVATE</Badge>}
                      <span className="text-xs text-muted-foreground">{post.category.name}</span>
                    </div>
                    <Link
                      href={post.visibility === 'private' ? `/blog/private/${post.id}` : (post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`)}
                      className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(post.updatedAt)} • {post.readingTimeMinutes} min read
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground self-end sm:self-center shrink-0">
                    <span className="flex items-center gap-1 text-foreground">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      {formatNumber(post.viewsCount)}
                    </span>
                    <Link href={`/dashboard/posts/${post.id}`}>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Articles Widget */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Top Stories</h2>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-primary font-semibold hover:underline"
            >
              Full Stats
            </Link>
          </div>

          {showSkeleton ? (
            <div
              aria-hidden="true"
              className="p-5 rounded-2xl bg-card border border-border/80 space-y-4"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-2 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                >
                  <Skeleton variant="text" className="w-16 h-2.5" />
                  <Skeleton variant="text" className="w-full h-3.5" />
                  <div className="flex justify-between pt-1">
                    <Skeleton variant="text" className="w-14 h-3" />
                    <Skeleton variant="text" className="w-12 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
              {stats.topArticles.length === 0 ? (
                <div className="p-6 text-center space-y-3 font-sans">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground">
                      No Top Performing Stories
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Published articles with high reader engagement, claps, and views will be ranked here.
                    </p>
                  </div>
                </div>
              ) : (
                stats.topArticles.slice(0, 5).map((art, idx) => (
                  <div
                    key={art.id || idx}
                    className="space-y-1.5 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-primary">
                        <Flame className="w-3 h-3" /> #{idx + 1} Top Story
                      </span>
                      <span className="text-[10px] text-muted-foreground">{art.readingTime}</span>
                    </div>
                    <Link
                      href={art.slug ? `/blog/${art.slug}` : `/blog/${art.id}`}
                      className="text-xs font-bold text-foreground hover:text-primary transition-colors line-clamp-2 block"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>{formatNumber(art.views)} views</span>
                      <span>{formatNumber(art.claps)} claps</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
