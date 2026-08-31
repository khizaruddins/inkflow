import { apiClient } from '@/lib/api-client';
import { User, BlogPost } from '@/types';
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
};
