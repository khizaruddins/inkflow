import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { normalizeUser } from './auth.service';

export const UserService = {
  async getUsers(): Promise<User[]> {
    try {
      const rawList = await apiClient.get<any[]>('/users');
      if (Array.isArray(rawList)) {
        return rawList.map(normalizeUser);
      }
      return [];
    } catch (err: any) {
      if (err?.status !== 401 && err?.response?.status !== 401) {
        console.error('Error fetching users:', err);
      }
      return [];
    }
  },

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const raw = await apiClient.get<any>(`/users/${username}`);
      if (raw) return normalizeUser(raw);
      return null;
    } catch (err) {
      console.error(`Error fetching user ${username}:`, err);
      return null;
    }
  },

  async followUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    try {
      const res = await apiClient.post<any>(`/users/${userId}/follow`);
      return {
        isFollowing: Boolean(res?.isFollowing),
        followersCount: res?.followersCount || 0,
      };
    } catch (err) {
      return { isFollowing: true, followersCount: 1 };
    }
  },
};
