import { useQuery } from '@tanstack/react-query';
import { AnalyticsSummary } from '@/types';
import { AnalyticsService } from '@/services/analytics.service';

export function useAnalyticsSummaryQuery() {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      return AnalyticsService.getSummary();
    },
  });
}
