import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReportService, ReportItem } from '@/services/report.service';

export function useReportsQuery() {
  return useQuery<ReportItem[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      return ReportService.getReports();
    },
  });
}

export function useDeleteReportedCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      return ReportService.deleteReportedComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDismissReportMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReportItem, Error, string>({
    mutationFn: async (id: string) => {
      return ReportService.dismissReport(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
