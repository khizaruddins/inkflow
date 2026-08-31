import { apiClient } from '@/lib/api-client';
import { CreatorApplication } from '@/types';
import { ActivityService } from './activity.service';

export interface SubmitApplicationDto {
  sampleTitle: string;
  sampleContent: string;
  motivation: string;
}

export const ApplicationService = {
  async getMyStatus(): Promise<CreatorApplication | null> {
    try {
      const res = await apiClient.get<CreatorApplication>('/applications/my-status');
      return res || null;
    } catch {
      return null;
    }
  },

  async submitApplication(dto: SubmitApplicationDto): Promise<CreatorApplication> {
    const res = await apiClient.post<CreatorApplication>('/applications', dto);
    ActivityService.logActivity('Submitted Creator Application for editorial review', 'application');
    return res;
  },

  async getAllApplications(): Promise<CreatorApplication[]> {
    return apiClient.get<CreatorApplication[]>('/applications');
  },

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<CreatorApplication> {
    return apiClient.patch<CreatorApplication>(`/applications/${id}/status`, { status });
  },
};
