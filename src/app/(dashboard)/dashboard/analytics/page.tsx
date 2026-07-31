import React from 'react';
import { AnalyticsService } from '@/services/analytics.service';
import { StatsOverview } from '@/features/dashboard/stats-overview';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export default async function AnalyticsPage() {
  const stats = await AnalyticsService.getSummary();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Deep-dive insights on audience acquisition, reading behavior, and content engagement.
        </p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Traffic Sources */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acquisition Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.trafficSources.map((source, idx) => (
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
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Readers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.countryStats.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-semibold text-foreground">{c.country}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{formatNumber(c.views)} views</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
