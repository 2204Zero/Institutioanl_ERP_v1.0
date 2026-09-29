import { useCallback, useState } from 'react';
import { useGlobalStore } from '../store/StoreContext';
import { authService } from '../services/authService';
import { LoginRequest, Role, Permission, User } from '../types/authTypes';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface UseAuthenticationResult {
  user: User | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  login: (credentials: LoginRequest) => Promise<LoginResult>;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  refreshToken: () => Promise<boolean>;
}

export function useAuthentication(): UseAuthenticationResult {
  const { state, dispatch } = useGlobalStore();
  const [loginError, setLoginError] = useState<string | null>(null);

  const user = state.auth.user;
  const isAuthenticated = state.auth.isAuthenticated || authService.isAuthenticated();
  const isAuthenticating = state.loading['auth_login'] === 'submitting';

  const clearLoginError = useCallback(() => {
    setLoginError(null);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResult> => {
      setLoginError(null);
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
          return { success: true };
        }

        const errMsg = response.message || 'Authentication failed. Please verify credentials.';
        setLoginError(errMsg);
        dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'error' } });
        return { success: false, error: errMsg };
      } catch (err: unknown) {
        const errMsg =
          (err as any)?.message ||
          (err as any)?.details?.message ||
          'Failed to sign in. Please verify your credentials or server connection.';
        setLoginError(errMsg);
        dispatch({ type: 'SET_LOADING', payload: { key: 'auth_login', state: 'error' } });
        return { success: false, error: errMsg };
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
      await logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    loginError,
    clearLoginError,
    login,
    logout,
    hasRole,
    hasPermission,
    refreshToken,
  };
}
