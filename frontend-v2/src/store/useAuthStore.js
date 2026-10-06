import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    login: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, isAuthenticated: false });
    },
}), {
    name: 'auth-storage',
    partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
}));
