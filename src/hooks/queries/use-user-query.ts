import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { UserService } from '@/services/user.service';

export function useUsersQuery() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      return UserService.getUsers();
    },
  });
}

export function useUserProfileQuery(username: string) {
  return useQuery<User | null>({
    queryKey: ['users', username],
    enabled: Boolean(username),
    queryFn: async () => {
      return UserService.getUserByUsername(username);
    },
  });
}

export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ isFollowing: boolean; followersCount: number }, Error, string>({
    mutationFn: async (userId: string) => {
      return UserService.followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
