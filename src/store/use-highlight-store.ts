import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LibraryService } from '@/services/library.service';

export interface UserHighlight {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  text: string;
  createdAt: string;
}

interface HighlightState {
  highlights: UserHighlight[];
  addHighlight: (postId: string, postTitle: string, postSlug: string, text: string) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  getHighlightsForPost: (postId: string) => UserHighlight[];
  syncFromBackend: () => Promise<void>;
}

export const useHighlightStore = create<HighlightState>()(
  persist(
    (set, get) => ({
      highlights: [],

      addHighlight: async (postId, postTitle, postSlug, text) => {
        if (!text.trim()) return;
        const exists = get().highlights.some((h) => h.postId === postId && h.text === text);
        if (exists) return;

        const newHl: UserHighlight = {
          id: `hl_${Date.now()}`,
          postId,
          postTitle,
          postSlug,
          text: text.trim(),
          createdAt: 'Just now',
        };

        set({ highlights: [newHl, ...get().highlights] });

        try {
          const res = await LibraryService.saveHighlight(postId, text);
          if (res && res.id) {
            set({
              highlights: get().highlights.map((h) => (h.id === newHl.id ? { ...h, id: res.id } : h)),
            });
          }
        } catch (err) {
          // Keep optimistic highlight
        }
      },

      removeHighlight: async (id) => {
        set({ highlights: get().highlights.filter((h) => h.id !== id) });
        try {
          await LibraryService.deleteHighlight(id);
        } catch (err) {
          // Keep state updated
        }
      },

      getHighlightsForPost: (postId) => {
        return get().highlights.filter((h) => h.postId === postId);
      },

      syncFromBackend: async () => {
        try {
          const list = await LibraryService.getHighlights();
          if (Array.isArray(list)) {
            set({
              highlights: list.map((item) => ({
                id: item.id,
                postId: item.postId,
                postTitle: 'Saved Story Highlight',
                postSlug: 'story-highlight',
                text: item.text,
                createdAt: new Date(item.createdAt).toLocaleDateString(),
              })),
            });
          }
        } catch (err) {
          // Keep local state
        }
      },
    }),
    {
      name: 'inkflow-highlights-storage',
    }
  )
);
