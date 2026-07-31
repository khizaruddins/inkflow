import { apiClient } from '@/lib/api-client';

export interface ReportItem {
  id: string;
  commentId: string;
  comment?: any;
  reporterId: string;
  reporter?: any;
  reasons: string[];
  blockedAuthor: boolean;
  status: 'UNDER_EVALUATION' | 'DELETED' | 'DISMISSED';
  createdAt: string;
}

export const ReportService = {
  async getReports(): Promise<ReportItem[]> {
    try {
      return await apiClient.get<ReportItem[]>('/reports');
    } catch (err) {
      return [];
    }
  },

  async deleteReportedComment(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/reports/${id}`);
  },

  async dismissReport(id: string): Promise<ReportItem> {
    return apiClient.patch<ReportItem>(`/reports/${id}/dismiss`);
  },
};
