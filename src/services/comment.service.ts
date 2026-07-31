import { apiClient } from '@/lib/api-client';
import { Comment } from '@/types';
import { normalizeUser } from './auth.service';

function normalizeComment(raw: any): Comment {
  return {
    id: raw.id || raw._id || `cm_${Date.now()}`,
    postId: raw.postId || '',
    author: raw.author ? normalizeUser(raw.author) : null as any,
    content: raw.content || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    clapsCount: raw.clapsCount || 0,
    parentId: raw.parentId || null,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeComment) : [],
  };
}

export const CommentService = {
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
      const rawList = await apiClient.get<any[]>(`/comments?postId=${postId}`);
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeComment);
      }
      return [];
    } catch (err) {
      console.error('Error fetching comments from backend:', err);
      return [];
    }
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const raw = await apiClient.post<any>('/comments', {
      postId,
      content,
      parentId: parentId || null,
    });
    return normalizeComment(raw);
  },

  async reportComment(commentId: string, reasons: string[], blockAuthor: boolean = false): Promise<any> {
    return apiClient.post<any>(`/comments/${commentId}/report`, {
      reasons,
      blockAuthor,
    });
  },

  async clapComment(commentId: string): Promise<number> {
    try {
      const res = await apiClient.post<any>(`/comments/${commentId}/clap`);
      return res?.clapsCount || 1;
    } catch (err) {
      return 1;
    }
  },
};
