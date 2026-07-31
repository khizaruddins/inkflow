import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReportService } from '@/services/report.service';
import { CommentService } from '@/services/comment.service';

export interface ResponseReport {
  id: string;
  commentId: string;
  authorName: string;
  commentContent: string;
  reasons: string[];
  blockedAuthor: boolean;
  reportedAt: string;
  status: 'under_evaluation' | 'deleted' | 'dismissed';
}

interface ReportState {
  reports: ResponseReport[];
  blockedAuthors: string[];
  reportResponse: (commentId: string, authorName: string, commentContent: string, reasons: string[], blockedAuthor: boolean) => Promise<void>;
  deleteReportedResponse: (reportId: string) => Promise<void>;
  dismissReport: (reportId: string) => Promise<void>;
  syncFromBackend: () => Promise<void>;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      blockedAuthors: [],

      reportResponse: async (commentId, authorName, commentContent, reasons, blockedAuthor) => {
        const newReport: ResponseReport = {
          id: `rep_${Date.now()}`,
          commentId,
          authorName,
          commentContent,
          reasons,
          blockedAuthor,
          reportedAt: new Date().toLocaleString(),
          status: 'under_evaluation',
        };

        const updatedBlocked = blockedAuthor
          ? Array.from(new Set([...get().blockedAuthors, authorName]))
          : get().blockedAuthors;

        set({
          reports: [newReport, ...get().reports],
          blockedAuthors: updatedBlocked,
        });

        try {
          await CommentService.reportComment(commentId, reasons, blockedAuthor);
        } catch (err) {
          // Keep local optimistic report
        }
      },

      deleteReportedResponse: async (reportId) => {
        set({
          reports: get().reports.map((r) => (r.id === reportId ? { ...r, status: 'deleted' as const } : r)),
        });
        try {
          await ReportService.deleteReportedComment(reportId);
        } catch (err) {
          // Keep local state
        }
      },

      dismissReport: async (reportId) => {
        set({
          reports: get().reports.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' as const } : r)),
        });
        try {
          await ReportService.dismissReport(reportId);
        } catch (err) {
          // Keep local state
        }
      },

      syncFromBackend: async () => {
        try {
          const list = await ReportService.getReports();
          if (Array.isArray(list) && list.length > 0) {
            set({
              reports: list.map((item) => ({
                id: item.id,
                commentId: item.commentId,
                authorName: item.comment?.author?.name || 'Reported User',
                commentContent: item.comment?.content || 'Reported comment content',
                reasons: item.reasons || [],
                blockedAuthor: item.blockedAuthor || false,
                reportedAt: new Date(item.createdAt).toLocaleString(),
                status: (item.status || 'UNDER_EVALUATION').toLowerCase() as any,
              })),
            });
          }
        } catch (err) {
          // Fallback to local state
        }
      },
    }),
    {
      name: 'inkflow-reports-storage',
    }
  )
);
