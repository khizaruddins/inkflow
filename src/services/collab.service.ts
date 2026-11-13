import { apiClient } from '@/lib/api-client';
import {
  CollabMode,
  CollabState,
  CollabSuggestion,
  CollabSuggestionStatus,
  CollabCollaborator,
} from '@/types';

export function getSocketServerUrl(): string {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (socketUrl && socketUrl.trim()) {
    return socketUrl.trim().replace(/\/api\/?$/, '');
  }
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_API ||
    'http://localhost:4000';
  return apiUrl.replace(/\/api\/?$/, '');
}

export const CollabService = {
  async getState(postId: string): Promise<CollabState> {
    const res = await apiClient.get<any>(`/posts/${postId}/collab/state`);
    return res?.data || res;
  },

  async invite(
    postId: string,
    params: {
      userId?: string;
      email?: string;
      username?: string;
      canEdit?: boolean;
      permission?: 'EDIT' | 'VIEW';
      regenerateToken?: boolean;
    },
  ): Promise<any> {
    const res = await apiClient.post<any>(`/posts/${postId}/collab/invite`, params);
    return res?.data || res;
  },

  async removeCollaborator(postId: string, userId: string): Promise<any> {
    const res = await apiClient.delete<any>(`/posts/${postId}/collab/collaborators/${userId}`);
    return res?.data || res;
  },

  async updatePermission(
    postId: string,
    userId: string,
    canEdit: boolean,
  ): Promise<CollabCollaborator> {
    const res = await apiClient.patch<any>(
      `/posts/${postId}/collab/collaborators/${userId}/permission`,
      { canEdit, permission: canEdit ? 'EDIT' : 'VIEW' },
    );
    return res?.data || res;
  },

  async regenerateToken(postId: string): Promise<{ id: string; collabInviteToken: string }> {
    const res = await apiClient.post<any>(`/posts/${postId}/collab/regenerate-token`);
    return res?.data || res;
  },

  async joinByToken(inviteToken: string): Promise<{
    success: boolean;
    postId: string;
    postTitle: string;
    redirectUrl: string;
  }> {
    const res = await apiClient.post<any>(`/posts/collab/join/${inviteToken}`);
    return res?.data || res;
  },

  async setMode(postId: string, mode: CollabMode): Promise<{ id: string; collabMode: CollabMode }> {
    const res = await apiClient.patch<any>(`/posts/${postId}/collab/mode`, { mode });
    return res?.data || res;
  },

  async listSuggestions(
    postId: string,
    status?: CollabSuggestionStatus,
  ): Promise<CollabSuggestion[]> {
    const res = await apiClient.get<any>(`/posts/${postId}/collab/suggestions`, { status });
    return res?.data || res || [];
  },

  async submitSuggestion(
    postId: string,
    dto: {
      title?: string;
      originalContent: string;
      suggestedContent: string;
      diffSummary?: string;
    },
  ): Promise<CollabSuggestion> {
    const res = await apiClient.post<any>(`/posts/${postId}/collab/suggestions`, dto);
    return res?.data || res;
  },

  async reviewSuggestion(
    postId: string,
    suggestionId: string,
    dto: {
      action: 'APPROVE' | 'REJECT';
      reviewNote?: string;
    },
  ): Promise<{
    suggestion: CollabSuggestion;
    mergedContent?: string;
    action: string;
  }> {
    const res = await apiClient.post<any>(
      `/posts/${postId}/collab/suggestions/${suggestionId}/review`,
      dto,
    );
    return res?.data || res;
  },
};
