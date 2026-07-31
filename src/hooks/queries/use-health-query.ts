import { useQuery } from '@tanstack/react-query';
import { HealthService, HealthCheckResult } from '@/services/health.service';

export function useHealthQuery() {
  return useQuery<HealthCheckResult>({
    queryKey: ['health'],
    refetchInterval: 30000, // Poll health every 30s
    queryFn: async () => {
      return HealthService.checkHealth();
    },
  });
}
