import { apiClient } from '@/lib/api-client';
import { getUnlockHeaders } from '@/lib/private-unlock';
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
  async getCommentsByPostId(postId: string, unlockToken?: string): Promise<Comment[]> {
    try {
      const rawList = await apiClient.get<any[]>(
        `/comments?postId=${encodeURIComponent(postId)}`,
        undefined,
        { headers: getUnlockHeaders(postId, undefined, unlockToken) }
      );
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeComment);
      }
      return [];
    } catch (err) {
      console.error('Error fetching comments from backend:', err);
      return [];
    }
  },

  async addComment(
    postId: string,
    content: string,
    parentId?: string,
    unlockToken?: string
  ): Promise<Comment> {
    const raw = await apiClient.post<any>(
      '/comments',
      {
        postId,
        content,
        parentId: parentId || null,
      },
      { headers: getUnlockHeaders(postId, undefined, unlockToken) }
    );
    return normalizeComment(raw);
  },

  async reportComment(commentId: string, reasons: string[], blockAuthor: boolean = false): Promise<any> {
    return apiClient.post<any>(`/comments/${commentId}/report`, {
      reasons,
      blockAuthor,
    });
  },

  async clapComment(commentId: string, postId?: string, unlockToken?: string): Promise<number> {
    const headers = postId || unlockToken ? getUnlockHeaders(postId, undefined, unlockToken) : undefined;
    const res = await apiClient.post<any>(
      `/comments/${commentId}/clap`,
      undefined,
      headers && Object.keys(headers).length > 0 ? { headers } : undefined
    );
    return res?.clapsCount || 1;
  },
};
