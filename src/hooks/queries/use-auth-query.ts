import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';
import { AuthService, LoginDto, RegisterDto } from '@/services/auth.service';
import { useAuthStore } from '@/store/use-auth-store';

export function useMeQuery() {
  const { setUser } = useAuthStore();

  return useQuery<User | null>({
    queryKey: ['auth', 'me'],
    retry: false,
    queryFn: async () => {
      const user = await AuthService.getMe();
      if (user) {
        setUser(user);
      }
      return user;
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation<User, Error, LoginDto>({
    mutationFn: async (dto) => {
      const user = await AuthService.login(dto);
      setUser(user);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation<User, Error, RegisterDto>({
    mutationFn: async (dto) => {
      const user = await AuthService.register(dto);
      setUser(user);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
