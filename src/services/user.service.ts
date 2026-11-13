import { apiClient } from '@/lib/api-client';
import { User, BlogPost, AccountDeletionRequest } from '@/types';
import { AuthService } from './auth.service';

export interface PublicUserProfile extends User {
  posts?: BlogPost[];
}

export const UserService = {
  async getUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>('/users');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  async getUserByUsername(username: string): Promise<PublicUserProfile | null> {
    try {
      const res = await apiClient.get<PublicUserProfile>(`/auth/users/by-username/${encodeURIComponent(username)}`);
      return res || null;
    } catch {
      return null;
    }
  },

  async getUserFollowers(idOrUsername: string): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>(`/auth/users/${encodeURIComponent(idOrUsername)}/followers`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  async getUserFollowing(idOrUsername: string): Promise<User[]> {
    try {
      const res = await apiClient.get<User[]>(`/auth/users/${encodeURIComponent(idOrUsername)}/following`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  async followUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await AuthService.toggleFollowUser(userId);
    return {
      isFollowing: res.following,
      followersCount: res.followingUserIds.length,
    };
  },

  // --------------------------------------------------------------------------
  // User Account Lifecycle & Controls
  // --------------------------------------------------------------------------

  async pauseAccount(): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.post('/users/pause', {});
  },

  async unpauseAccount(): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.post('/users/unpause', {});
  },

  async requestDeletion(email: string): Promise<{ success: boolean; message: string; scheduledFor: string; user: User }> {
    return apiClient.post('/users/request-deletion', { email });
  },

  async cancelDeletion(): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.post('/users/cancel-deletion', {});
  },

  // --------------------------------------------------------------------------
  // Admin Moderation & Deletion Management
  // --------------------------------------------------------------------------

  async getDeletionRequests(): Promise<AccountDeletionRequest[]> {
    try {
      const res = await apiClient.get<AccountDeletionRequest[]>('/users/admin/deletion-requests');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  async suspendUser(userId: string, reason?: string): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.patch(`/users/admin/${userId}/suspend`, { reason });
  },

  async unsuspendUser(userId: string): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient.patch(`/users/admin/${userId}/unsuspend`, {});
  },

  async hardDeleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/users/admin/${userId}/hard-delete`);
  },
};
