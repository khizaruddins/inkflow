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

  return useMutation<{ bookmarked: boolean }, Error, { postId: string; unlockToken?: string } | string>({
    mutationFn: async (arg) => {
      if (typeof arg === 'string') {
        return LibraryService.toggleBookmark(arg);
      }
      return LibraryService.toggleBookmark(arg.postId, arg.unlockToken);
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

  return useMutation<Highlight, Error, { postId: string; text: string; unlockToken?: string }>({
    mutationFn: async ({ postId, text, unlockToken }) => {
      return LibraryService.saveHighlight(postId, text, undefined, undefined, unlockToken);
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
