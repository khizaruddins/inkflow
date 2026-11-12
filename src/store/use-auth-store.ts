import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { AuthService, LoginDto, RegisterDto, UpdateProfileDto } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  privateNotesPassword?: string;
  isLoading: boolean;
  isCheckingAuth: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  toggleDemoRole: () => void;
  updateProfile: (updated: UpdateProfileDto) => Promise<User>;
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
      isCheckingAuth: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          role: user?.role || 'reader',
          isCheckingAuth: false,
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

      updateProfile: async (updated) => {
        const updatedUser = await AuthService.updateProfile(updated);
        set({
          user: updatedUser,
          role: updatedUser.role,
          isAuthenticated: true,
        });
        return updatedUser;
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
          try {
            const { useBookmarkStore } = await import('./use-bookmark-store');
            useBookmarkStore.getState().clearBookmarks();
          } catch {}
          if (typeof window !== 'undefined') {
            localStorage.removeItem('inkflow_access_token');
            localStorage.removeItem('inkflow_refresh_token');
            localStorage.removeItem('inkflow-auth-storage');
            localStorage.removeItem('inkflow-bookmarks-storage');
          }
        }
      },

      fetchCurrentUser: async () => {
        set({ isCheckingAuth: true });
        try {
          const user = await AuthService.getMe();
          if (user) {
            set({ user, isAuthenticated: true, role: user.role, isCheckingAuth: false });
            return user;
          }

          // If getMe returned null, try refresh token before clearing
          const refreshed = await AuthService.refreshToken();
          if (refreshed) {
            set({ user: refreshed, isAuthenticated: true, role: refreshed.role, isCheckingAuth: false });
            return refreshed;
          }

          // If neither returned a user, clear unauthenticated state
          set({ user: null, isAuthenticated: false, role: 'reader', isCheckingAuth: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('inkflow_access_token');
            localStorage.removeItem('inkflow_refresh_token');
            localStorage.removeItem('inkflow-auth-storage');
            localStorage.removeItem('inkflow-bookmarks-storage');
          }
          return null;
        } catch (err: any) {
          try {
            const refreshed = await AuthService.refreshToken();
            if (refreshed) {
              set({ user: refreshed, isAuthenticated: true, role: refreshed.role, isCheckingAuth: false });
              return refreshed;
            }
          } catch {}

          set({ user: null, isAuthenticated: false, role: 'reader', isCheckingAuth: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('inkflow_access_token');
            localStorage.removeItem('inkflow_refresh_token');
            localStorage.removeItem('inkflow-auth-storage');
            localStorage.removeItem('inkflow-bookmarks-storage');
          }
          return null;
        }
      },
    }),
    {
      name: 'inkflow-auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        privateNotesPassword: state.privateNotesPassword,
      }),
    }
  )
);
