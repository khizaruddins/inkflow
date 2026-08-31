import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { AuthService, LoginDto, RegisterDto } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  privateNotesPassword?: string;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  toggleDemoRole: () => void;
  updateProfile: (updated: Partial<User>) => void;
  setPrivateNotesPassword: (password: string) => void;
  login: (dto: LoginDto) => Promise<User>;
  register: (dto: RegisterDto) => Promise<User>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: 'reader',
      isAuthenticated: false,
      privateNotesPassword: undefined,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          role: user?.role || 'reader',
        }),

      setRole: (role) => set({ role }),

      toggleDemoRole: () => {
        const currentRole = get().role;
        const nextRole: UserRole =
          currentRole === 'reader' || currentRole === 'READER' ? 'writer' : 'reader';
        const currentUser = get().user;
        set({
          role: nextRole,
          user: currentUser ? { ...currentUser, role: nextRole } : null,
        });
      },

      updateProfile: (updated) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updated } });
        }
      },

      setPrivateNotesPassword: (password) => set({ privateNotesPassword: password }),

      login: async (dto) => {
        set({ isLoading: true });
        try {
          const user = await AuthService.login(dto);
          set({ user, isAuthenticated: true, role: user.role, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (dto) => {
        set({ isLoading: true });
        try {
          const user = await AuthService.register(dto);
          set({ user, isAuthenticated: true, role: user.role, isLoading: false });
          return user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch (err) {
          // Ignore error on logout
        } finally {
          set({ user: null, isAuthenticated: false, role: 'reader' });
        }
      },

      fetchCurrentUser: async () => {
        try {
          const user = await AuthService.getMe();
          if (user) {
            set({ user, isAuthenticated: true, role: user.role });
            return user;
          }

          // If getMe returned null, try refresh token before clearing
          const refreshed = await AuthService.refreshToken();
          if (refreshed) {
            set({ user: refreshed, isAuthenticated: true, role: refreshed.role });
            return refreshed;
          }

          // If neither returned a user, check if we had any user
          const currentUser = get().user;
          if (!currentUser) {
            set({ user: null, isAuthenticated: false });
          }
          return null;
        } catch (err: any) {
          try {
            const refreshed = await AuthService.refreshToken();
            if (refreshed) {
              set({ user: refreshed, isAuthenticated: true, role: refreshed.role });
              return refreshed;
            }
          } catch {}

          if (err?.response?.status === 401 || err?.status === 401) {
            set({ user: null, isAuthenticated: false });
          }
          return null;
        }
      },
    }),
    {
      name: 'inkflow-auth-storage',
    }
  )
);
