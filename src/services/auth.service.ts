import { apiClient } from '@/lib/api-client';
import { User, UserRole } from '@/types';

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
  const role: UserRole =
    typeof rawUser.role === 'string' && rawUser.role.toLowerCase() === 'admin'
      ? 'admin'
      : 'reader';

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
    followingCount: rawUser.followingCount || 0,
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
    return normalizeUser(target);
  },

  async login(dto: LoginDto): Promise<User> {
    const raw = await apiClient.post<any>('/auth/login', dto);
    const target = raw?.user ? raw.user : raw;
    return normalizeUser(target);
  },

  async logout(): Promise<{ message: string }> {
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
};
