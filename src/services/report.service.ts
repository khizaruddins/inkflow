import { apiClient } from '@/lib/api-client';
import { PostReport } from '@/types';

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
  // --------------------------------------------------------------------------
  // Comment Reports
  // --------------------------------------------------------------------------
  async getReports(): Promise<ReportItem[]> {
    try {
      return await apiClient.get<ReportItem[]>('/reports');
    } catch {
      return [];
    }
  },

  async deleteReportedComment(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/reports/${id}`);
  },

  async dismissReport(id: string): Promise<ReportItem> {
    return apiClient.patch<ReportItem>(`/reports/${id}/dismiss`);
  },

  // --------------------------------------------------------------------------
  // Post (Story) Reports
  // --------------------------------------------------------------------------
  async reportPost(postId: string, reason: string, customNote?: string): Promise<{ success: boolean; message: string; report: PostReport }> {
    return apiClient.post(`/posts/${postId}/report`, { reason, customNote });
  },

  async getPostReports(): Promise<PostReport[]> {
    try {
      const res = await apiClient.get<PostReport[]>('/reports/posts');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  async deleteReportedPost(reportId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/reports/posts/${reportId}`);
  },

  async warnPostAuthor(reportId: string, comment: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/reports/posts/${reportId}/warn`, { comment });
  },

  async dismissPostReport(reportId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/reports/posts/${reportId}/dismiss`, {});
  },
};
