import { apiClient } from '@/lib/api-client';

export interface ReadingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  postIds: string[];
  notes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  post?: any;
  createdAt: string;
}

export interface Highlight {
  id: string;
  userId: string;
  postId: string;
  text: string;
  createdAt: string;
}

export interface ReadingHistoryItem {
  id: string;
  userId: string;
  postId: string;
  post?: any;
  viewedAt: string;
}

export const LibraryService = {
  // Custom Reading Lists
  async getLists(): Promise<ReadingList[]> {
    try {
      return await apiClient.get<ReadingList[]>('/library/lists');
    } catch (err) {
      return [];
    }
  },

  async createList(dto: { name: string; description?: string; isPrivate?: boolean; postIds?: string[] }): Promise<ReadingList> {
    return apiClient.post<ReadingList>('/library/lists', dto);
  },

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      return await apiClient.get<Bookmark[]>('/library/bookmarks');
    } catch (err) {
      return [];
    }
  },

  async toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
    return apiClient.post<{ bookmarked: boolean }>('/library/bookmarks/toggle', { postId });
  },

  // Quote Highlights
  async getHighlights(): Promise<Highlight[]> {
    try {
      return await apiClient.get<Highlight[]>('/library/highlights');
    } catch (err) {
      return [];
    }
  },

  async saveHighlight(postId: string, text: string): Promise<Highlight> {
    return apiClient.post<Highlight>('/library/highlights', { postId, text });
  },

  async deleteHighlight(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/library/highlights/${id}`);
  },

  // Reading History
  async getHistory(): Promise<ReadingHistoryItem[]> {
    try {
      return await apiClient.get<ReadingHistoryItem[]>('/library/history');
    } catch (err) {
      return [];
    }
  },

  async recordHistory(postId: string): Promise<ReadingHistoryItem | null> {
    try {
      return await apiClient.post<ReadingHistoryItem>('/library/history', { postId });
    } catch (err) {
      return null;
    }
  },
};
