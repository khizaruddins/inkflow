'use client';

import React from 'react';
import { Eye, FileText, Heart, Users, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsSummary } from '@/types';
import { formatNumber } from '@/lib/utils';

export function StatsOverview({ stats }: { stats: AnalyticsSummary }) {
  const kpis = [
    {
      title: 'Total Article Views',
      value: formatNumber(stats.totalViews),
      trend: `+${stats.viewsTrend}% this month`,
      icon: Eye,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Published Articles',
      value: stats.totalPublished.toString(),
      trend: `+${stats.publishedTrend}% this month`,
      icon: FileText,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Total Reader Claps',
      value: formatNumber(stats.totalClaps),
      trend: `+${stats.clapsTrend}% this month`,
      icon: Heart,
      color: 'text-rose-500 bg-rose-500/10',
    },
    {
      title: 'Active Subscribers',
      value: formatNumber(stats.totalSubscribers),
      trend: `+${stats.subscribersTrend}% this month`,
      icon: Users,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">{kpi.title}</span>
              <div className="text-2xl font-extrabold tracking-tight text-foreground">{kpi.value}</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <TrendingUp className="w-3 h-3" />
                {kpi.trend}
              </div>
            </div>
            <div className={`p-3 rounded-2xl ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
