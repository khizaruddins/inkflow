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
  title?: string;
  note?: string;
  post?: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
    author?: { id?: string; name: string; avatar?: string };
  };
  createdAt: string;
}

export interface ReadingHistoryItem {
  id: string;
  userId: string;
  postId: string;
  post?: any;
  viewedAt: string;
  postTitle?: string;
  postSlug?: string;
  postExcerpt?: string;
  authorName?: string;
  coverImage?: string;
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
      const raw = await apiClient.get<Bookmark[]>('/library/bookmarks');
      return Array.isArray(raw) ? raw : [];
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
      const raw = await apiClient.get<Highlight[]>('/library/highlights');
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  },

  async saveHighlight(postId: string, text: string, title?: string, note?: string): Promise<Highlight> {
    return apiClient.post<Highlight>('/library/highlights', { postId, text, title, note });
  },

  async deleteHighlight(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/library/highlights/${id}`);
  },

  // Reading History
  async getHistory(): Promise<ReadingHistoryItem[]> {
    try {
      const items = await apiClient.get<any[]>('/library/history');
      if (!Array.isArray(items)) return [];
      return items.map((item) => ({
        id: item.id,
        userId: item.userId,
        postId: item.postId,
        viewedAt: item.viewedAt,
        postTitle: item.post?.title || item.postTitle || 'Untitled Story',
        postSlug: item.post?.slug || item.postSlug || '',
        postExcerpt: item.post?.excerpt || item.postExcerpt || '',
        authorName: item.post?.author?.name || item.authorName || 'Writer on InkFlow',
        coverImage: item.post?.coverImage || item.coverImage || '',
      }));
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
