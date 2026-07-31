import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LibraryService,
  ReadingList,
  Bookmark,
  Highlight,
  ReadingHistoryItem,
} from '@/services/library.service';

export function useReadingListsQuery() {
  return useQuery<ReadingList[]>({
    queryKey: ['library', 'lists'],
    queryFn: async () => {
      return LibraryService.getLists();
    },
  });
}

export function useCreateListMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ReadingList,
    Error,
    { name: string; description?: string; isPrivate?: boolean; postIds?: string[] }
  >({
    mutationFn: async (dto) => {
      return LibraryService.createList(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'lists'] });
    },
  });
}

export function useBookmarksQuery() {
  return useQuery<Bookmark[]>({
    queryKey: ['library', 'bookmarks'],
    queryFn: async () => {
      return LibraryService.getBookmarks();
    },
  });
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ bookmarked: boolean }, Error, string>({
    mutationFn: async (postId: string) => {
      return LibraryService.toggleBookmark(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'bookmarks'] });
    },
  });
}

export function useHighlightsQuery() {
  return useQuery<Highlight[]>({
    queryKey: ['library', 'highlights'],
    queryFn: async () => {
      return LibraryService.getHighlights();
    },
  });
}

export function useSaveHighlightMutation() {
  const queryClient = useQueryClient();

  return useMutation<Highlight, Error, { postId: string; text: string }>({
    mutationFn: async ({ postId, text }) => {
      return LibraryService.saveHighlight(postId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'highlights'] });
    },
  });
}

export function useDeleteHighlightMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      return LibraryService.deleteHighlight(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'highlights'] });
    },
  });
}

export function useHistoryQuery() {
  return useQuery<ReadingHistoryItem[]>({
    queryKey: ['library', 'history'],
    queryFn: async () => {
      return LibraryService.getHistory();
    },
  });
}
