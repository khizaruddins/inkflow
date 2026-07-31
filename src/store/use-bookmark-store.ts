import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LibraryService } from '@/services/library.service';

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
  toggleBookmark: (postId: string) => Promise<void>;
  isBookmarked: (postId: string) => boolean;
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

      toggleBookmark: async (postId) => {
        const current = get().bookmarkedIds;
        const exists = current.includes(postId);
        // Optimistic update
        set({
          bookmarkedIds: exists ? current.filter((id) => id !== postId) : [...current, postId],
        });

        try {
          await LibraryService.toggleBookmark(postId);
        } catch (err) {
          // Keep local state intact
        }
      },

      isBookmarked: (postId) => get().bookmarkedIds.includes(postId),

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
