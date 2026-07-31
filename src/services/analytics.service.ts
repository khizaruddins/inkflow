import { apiClient } from '@/lib/api-client';
import { AnalyticsSummary } from '@/types';

export const AnalyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    try {
      const summary = await apiClient.get<AnalyticsSummary>('/analytics');
      if (summary && typeof summary.totalViews === 'number') {
        return summary;
      }
    } catch (err) {
      console.error('Error fetching analytics summary:', err);
    }

    return {
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
  },
};
