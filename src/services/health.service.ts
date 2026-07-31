import { apiClient } from '@/lib/api-client';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details?: Record<string, any>;
}

export const HealthService = {
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      return await apiClient.get<HealthCheckResult>('/health');
    } catch (err: any) {
      return {
        status: 'error',
        error: { message: err?.message || 'Health check failed' },
      };
    }
  },
};
