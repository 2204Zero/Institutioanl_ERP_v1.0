import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) => {
        set({ token, refreshToken, user, isAuthenticated: true });
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        refreshToken: state.refreshToken,
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);