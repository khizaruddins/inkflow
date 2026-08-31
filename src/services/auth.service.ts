import { apiClient } from '@/lib/api-client';
import { User, UserRole } from '@/types';
import { ActivityService } from './activity.service';

export interface RegisterDto {
  email: string;
  name: string;
  username: string;
  password: string;
  role?: 'READER' | 'WRITER' | 'ADMIN';
}

export interface LoginDto {
  email: string;
  password: string;
}

export function normalizeUser(rawUser: any): User {
  if (!rawUser) return null as any;
  const rawRole = typeof rawUser.role === 'string' ? rawUser.role.toLowerCase() : 'reader';
  const role: UserRole = rawRole === 'admin' ? 'admin' : rawRole === 'writer' ? 'writer' : 'reader';

  return {
    id: rawUser.id || rawUser._id || 'usr_unknown',
    name: rawUser.name || 'Anonymous User',
    username: rawUser.username || 'user',
    email: rawUser.email || '',
    avatar:
      rawUser.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: rawUser.bio || '',
    role,
    followersCount: rawUser.followersCount || 0,
    followingCount: rawUser.followingCount || (rawUser.followingUserIds?.length ?? 0),
    followingUserIds: Array.isArray(rawUser.followingUserIds) ? rawUser.followingUserIds : [],
    articlesCount: rawUser.articlesCount || 0,
    twitter: rawUser.twitter,
    github: rawUser.github,
    website: rawUser.website,
    createdAt: rawUser.createdAt || new Date().toISOString(),
  };
}

export const AuthService = {
  async register(dto: RegisterDto): Promise<User> {
    const raw = await apiClient.post<any>('/auth/register', dto);
    const target = raw?.user ? raw.user : raw;
    if (raw?.tokens?.accessToken && typeof window !== 'undefined') {
      localStorage.setItem('inkflow_access_token', raw.tokens.accessToken);
      if (raw.tokens.refreshToken) {
        localStorage.setItem('inkflow_refresh_token', raw.tokens.refreshToken);
      }
    }
    ActivityService.logActivity('Joined InkFlow publishing platform', 'join');
    return normalizeUser(target);
  },

  async login(dto: LoginDto): Promise<User> {
    const raw = await apiClient.post<any>('/auth/login', dto);
    const target = raw?.user ? raw.user : raw;
    if (raw?.tokens?.accessToken && typeof window !== 'undefined') {
      localStorage.setItem('inkflow_access_token', raw.tokens.accessToken);
      if (raw.tokens.refreshToken) {
        localStorage.setItem('inkflow_refresh_token', raw.tokens.refreshToken);
      }
    }
    return normalizeUser(target);
  },

  async logout(): Promise<{ message: string }> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('inkflow_access_token');
      localStorage.removeItem('inkflow_refresh_token');
    }
    try {
      return await apiClient.post<{ message: string }>('/auth/logout');
    } catch (err) {
      return { message: 'Logged out successfully' };
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const raw = await apiClient.get<any>('/auth/me');
      const target = raw?.user ? raw.user : raw;
      return normalizeUser(target);
    } catch (err) {
      return null;
    }
  },

  async refreshToken(): Promise<User | null> {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('inkflow_refresh_token') : null;
      const raw = await apiClient.post<any>('/auth/refresh', { refreshToken });
      const target = raw?.user ? raw.user : raw;
      if (raw?.tokens?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('inkflow_access_token', raw.tokens.accessToken);
        if (raw.tokens.refreshToken) {
          localStorage.setItem('inkflow_refresh_token', raw.tokens.refreshToken);
        }
      }
      return normalizeUser(target);
    } catch (err) {
      return null;
    }
  },

  async toggleFollowUser(
    targetUserId: string,
    targetAuthorName?: string
  ): Promise<{
    following: boolean;
    followingUserIds: string[];
    targetUser?: { id: string; name: string; username: string };
  }> {
    const res = await apiClient.post<any>(`/auth/users/${targetUserId}/follow`);
    const following = Boolean(res?.following);
    const followingUserIds = res?.followingUserIds || [];
    const targetUser = res?.targetUser;

    const authorName = targetAuthorName || targetUser?.name || 'writer';
    if (following) {
      ActivityService.logActivity(`Started following ${authorName}`, 'follow');
    }

    return {
      following,
      followingUserIds,
      targetUser,
    };
  },

  async resetPassword(dto: { email: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<any>('/auth/reset-password', dto);
    ActivityService.logActivity('Reset account password', 'join');
    return res;
  },
};
