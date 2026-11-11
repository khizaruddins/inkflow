import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LibraryService } from '@/services/library.service';
import { useAuthStore } from './use-auth-store';

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  postIds: string[];
  coverImages: string[];
  updatedAt: string;
}

interface BookmarkState {
  bookmarkedIds: string[];
  lists: ReadingList[];
  toggleBookmark: (postId: string, unlockToken?: string) => Promise<boolean>;
  isBookmarked: (postId: string) => boolean;
  clearBookmarks: () => void;
  createList: (name: string, description?: string, isPrivate?: boolean) => Promise<void>;
  addToList: (listId: string, postId: string) => void;
  removeFromList: (listId: string, postId: string) => void;
  syncFromBackend: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      lists: [],

      toggleBookmark: async (postId, unlockToken) => {
        const auth = useAuthStore.getState();
        if (!auth.isAuthenticated || !auth.user) {
          const err: any = new Error('LOGIN_REQUIRED');
          err.status = 401;
          err.code = 'LOGIN_REQUIRED';
          throw err;
        }

        // Only update local bookmark state after HTTP 200/201 succeeds
        const res = await LibraryService.toggleBookmark(postId, unlockToken);
        const current = get().bookmarkedIds;
        const bookmarked =
          res && typeof res === 'object' && 'bookmarked' in res
            ? Boolean(res.bookmarked)
            : !current.includes(postId);
        set({
          bookmarkedIds: bookmarked
            ? Array.from(new Set([...current, postId]))
            : current.filter((id) => id !== postId),
        });
        return bookmarked;
      },

      isBookmarked: (postId) => {
        const auth = useAuthStore.getState();
        if (!auth.isAuthenticated || !auth.user) return false;
        return get().bookmarkedIds.includes(postId);
      },

      clearBookmarks: () => {
        set({ bookmarkedIds: [], lists: [] });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('inkflow-bookmarks-storage');
          } catch {}
        }
      },

      createList: async (name, description = '', isPrivate = true) => {
        const newList: ReadingList = {
          id: `list_${Date.now()}`,
          name,
          description,
          isPrivate,
          postIds: [],
          coverImages: [],
          updatedAt: 'Just now',
        };
        set({ lists: [newList, ...get().lists] });

        try {
          await LibraryService.createList({ name, description, isPrivate });
        } catch (err) {
          // Keep local list
        }
      },

      addToList: (listId, postId) => {
        set({
          lists: get().lists.map((l) =>
            l.id === listId && !l.postIds.includes(postId)
              ? { ...l, postIds: [...l.postIds, postId] }
              : l
          ),
        });
      },

      removeFromList: (listId, postId) => {
        set({
          lists: get().lists.map((l) =>
            l.id === listId
              ? { ...l, postIds: l.postIds.filter((id) => id !== postId) }
              : l
          ),
        });
      },

      syncFromBackend: async () => {
        const auth = useAuthStore.getState();
        if (!auth.isAuthenticated || !auth.user) {
          get().clearBookmarks();
          return;
        }
        try {
          const backendBookmarks = await LibraryService.getBookmarks();
          if (Array.isArray(backendBookmarks)) {
            set({ bookmarkedIds: backendBookmarks.map((b) => b.postId) });
          }
          const backendLists = await LibraryService.getLists();
          if (Array.isArray(backendLists)) {
            set({
              lists: backendLists.map((l) => ({
                id: l.id,
                name: l.name,
                description: l.description,
                isPrivate: l.isPrivate,
                postIds: l.postIds || [],
                coverImages: [],
                updatedAt: new Date(l.updatedAt).toLocaleDateString(),
              })),
            });
          }
        } catch (err) {
          // Ignore sync errors
        }
      },
    }),
    {
      name: 'inkflow-bookmarks-storage',
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state, prev) => {
    if (prev.isAuthenticated && !state.isAuthenticated) {
      useBookmarkStore.getState().clearBookmarks();
    }
  });
}
