import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/types';
import { CommentService } from '@/services/comment.service';

export function useCommentsQuery(postId: string) {
  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      return CommentService.getCommentsByPostId(postId);
    },
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, { postId: string; content: string; parentId?: string }>({
    mutationFn: async ({ postId, content, parentId }) => {
      return CommentService.addComment(postId, content, parentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
}

export function useReportCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { commentId: string; reasons: string[]; blockAuthor?: boolean }>({
    mutationFn: async ({ commentId, reasons, blockAuthor }) => {
      return CommentService.reportComment(commentId, reasons, blockAuthor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
