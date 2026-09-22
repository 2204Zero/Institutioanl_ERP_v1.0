import { useCallback } from 'react';
import { useGlobalStore } from '../store/StoreContext';
import { authService } from '../services/authService';
import { LoginRequest, Role, Permission, User } from '../types/authTypes';

export interface UseAuthenticationResult {
  user: User | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  refreshToken: () => Promise<boolean>;
}

export function useAuthentication(): UseAuthenticationResult {
  const { state, dispatch } = useGlobalStore();

  const user = state.auth.user;
  const isAuthenticated = state.auth.isAuthenticated || authService.isAuthenticated();
  const isAuthenticating = state.auth.isAuthenticating;

  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'submitting' } });
      try {
        const response = await authService.login(credentials);
        if (response.success && response.data) {
          dispatch({
            type: 'SET_AUTH',
            payload: {
              user: response.data.user,
              tokens: response.data.token,
            },
          });
          dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'idle' } });
          return true;
        }
        dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'error' } });
        return false;
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'error' } });
        return false;
      }
    },
    [dispatch]
  );

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const hasRole = useCallback(
    (role: Role | Role[]): boolean => {
      if (!user) return false;
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      return user.role === role;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: Permission | Permission[]): boolean => {
      if (!user || !user.permissions) return false;
      if (Array.isArray(permission)) {
        return permission.every((p) => user.permissions.includes(p));
      }
      return user.permissions.includes(permission);
    },
    [user]
  );

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken();
      return response.success;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    login,
    logout,
    hasRole,
    hasPermission,
    refreshToken,
  };
}
