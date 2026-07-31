import { create } from 'zustand';
import { SearchFilterState } from '@/types';

interface FilterStore extends SearchFilterState {
  setQuery: (query: string) => void;
  setCategorySlug: (categorySlug?: string) => void;
  setTagSlug: (tagSlug?: string) => void;
  setAuthorUsername: (authorUsername?: string) => void;
  setSortBy: (sortBy: SearchFilterState['sortBy']) => void;
  resetFilters: () => void;
}

const initialFilters: SearchFilterState = {
  query: '',
  categorySlug: undefined,
  tagSlug: undefined,
  authorUsername: undefined,
  status: undefined,
  sortBy: 'latest',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialFilters,
  setQuery: (query) => set({ query }),
  setCategorySlug: (categorySlug) => set({ categorySlug }),
  setTagSlug: (tagSlug) => set({ tagSlug }),
  setAuthorUsername: (authorUsername) => set({ authorUsername }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () => set(initialFilters),
}));
