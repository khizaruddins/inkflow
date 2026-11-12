'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Eye, Clock, Flame, BarChart3 } from 'lucide-react';
import { AnalyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/use-auth-store';
import { StatsOverview } from '@/features/dashboard/stats-overview';
import { StatsOverviewSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnalyticsSummary } from '@/types';
import { formatNumber } from '@/lib/utils';

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

function AnalyticsBreakdownSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {[0, 1].map((col) => (
        <div
          key={col}
          className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 space-y-4"
        >
          <Skeleton variant="text" className="w-44 h-5" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} variant="rect" className="w-full h-10 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  const [stats, setStats] = useState<AnalyticsSummary>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAnalytics() {
      if (isCheckingAuth || !isAuthenticated) return;
      setLoading(true);
      try {
        const data = await AnalyticsService.getSummary();
        if (active) setStats(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAnalytics();
    return () => {
      active = false;
    };
  }, [isCheckingAuth, isAuthenticated]);

  const showSkeleton = isCheckingAuth || loading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-14rem)] font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Platform Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep-dive insights on audience engagement, verified reads, claps, and top-performing stories.
          </p>
        </div>

        {!showSkeleton && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/80 text-xs font-semibold text-foreground">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{stats.readingTimeHours.toLocaleString()} hrs total reader time</span>
          </div>
        )}
      </div>

      {showSkeleton ? <StatsOverviewSkeleton /> : <StatsOverview stats={stats} />}

      {showSkeleton ? (
        <AnalyticsBreakdownSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Performing Stories (3-5 top published articles by views + claps + comments) */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Top Performing Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topArticles.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">
                        No Top Performing Stories
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Published articles with high reader engagement, claps, and views will be ranked here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topArticles.slice(0, 5).map((art, idx) => (
                      <div
                        key={art.id || idx}
                        className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {art.readingTime}
                            </span>
                          </div>
                          <Link
                            href={art.slug ? `/blog/${art.slug}` : `/dashboard/posts/${art.id}`}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                          >
                            {art.title}
                          </Link>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            {formatNumber(art.views)} views
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatNumber(art.claps)} claps
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acquisition Channels & Recent Reading Activity */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Acquisition Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.trafficSources.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Traffic source breakdown will appear as readers complete articles.
                  </p>
                ) : (
                  stats.trafficSources.map((source, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>{source.name}</span>
                        <span>{source.value}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${source.value}%`, backgroundColor: source.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {stats.dailyViews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Reading Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {stats.dailyViews.slice(-5).map((d) => (
                    <div
                      key={d.date}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-xs"
                    >
                      <span className="font-semibold text-foreground">{d.date}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(d.views)} reads • {formatNumber(d.uniqueVisitors)} readers
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
