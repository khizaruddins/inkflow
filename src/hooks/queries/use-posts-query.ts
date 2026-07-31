import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogPost, SearchFilterState, Category, Tag } from '@/types';
import { BlogService } from '@/services/blog.service';

export function usePostsQuery(filters?: SearchFilterState) {
  return useQuery<BlogPost[]>({
    queryKey: ['posts', filters],
    queryFn: async () => {
      return BlogService.getPosts(filters);
    },
  });
}

export function usePostQuery(slugOrId: string) {
  return useQuery<BlogPost | null>({
    queryKey: ['post', slugOrId],
    enabled: Boolean(slugOrId),
    queryFn: async () => {
      return BlogService.getPostBySlugOrId(slugOrId);
    },
  });
}

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      return BlogService.getCategories();
    },
  });
}

export function useTagsQuery() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      return BlogService.getTags();
    },
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation<BlogPost, Error, any>({
    mutationFn: async (dto: any) => {
      return BlogService.createPost(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation<BlogPost, Error, { id: string; dto: any }>({
    mutationFn: async ({ id, dto }) => {
      return BlogService.updatePost(id, dto);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useClapPostMutation() {
  const queryClient = useQueryClient();

  return useMutation<number, Error, { id: string; count?: number }>({
    mutationFn: async ({ id, count = 1 }) => {
      return BlogService.clapPost(id, count);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useBulkDeletePostsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      return BlogService.bulkDeletePosts(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useBulkPublishPostsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      return BlogService.bulkPublishPosts(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
