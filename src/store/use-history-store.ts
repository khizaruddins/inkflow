import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
  id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  postExcerpt: string;
  authorName: string;
  coverImage: string;
  viewedAt: string;
}

interface HistoryState {
  history: HistoryItem[];
  recordView: (item: Omit<HistoryItem, 'id' | 'viewedAt'>) => void;
  clearHistory: () => void;
}

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist_1',
    postId: 'post_1',
    postTitle: 'Building Next-Generation React 19 Frontend Architectures',
    postSlug: 'building-next-generation-react-19-frontend-architectures',
    postExcerpt: 'A deep dive into React 19 Server Components, fine-grained reactivity, and TipTap rich-text integration.',
    authorName: 'Syed Khizaruddin',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    viewedAt: '2 hours ago',
  },
  {
    id: 'hist_2',
    postId: 'post_2',
    postTitle: 'Designing Minimalist & Tactile Web Interfaces in 2026',
    postSlug: 'designing-minimalist-tactile-web-interfaces-2026',
    postExcerpt: 'How leading digital publications use generous whitespace, curated dark mode palettes, and dynamic typography.',
    authorName: 'Syed Khizaruddin',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    viewedAt: 'Yesterday',
  },
];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: INITIAL_HISTORY,
      recordView: (item) => {
        const filtered = get().history.filter((h) => h.postId !== item.postId);
        const newItem: HistoryItem = {
          ...item,
          id: `hist_${Date.now()}`,
          viewedAt: 'Just now',
        };
        set({ history: [newItem, ...filtered] });
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'inkflow-history-storage',
    }
  )
);
