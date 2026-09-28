import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  User,
  LoginRequest,
  SignUpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/authTypes';
import { tokenStorage } from '../utils/tokenStorage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      if (tokenStorage.getAccessToken()) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            setIsAuthenticated(true);
          }
        } catch {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      } else {
        setError(response.message || 'Authentication failed');
        return response;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.loginWithGoogle();
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.loginWithMicrosoft();
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGitHub = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.loginWithGitHub();
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.signUp(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      return await authService.requestPasswordReset(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    try {
      return await authService.resetPassword(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (data: VerifyEmailRequest) => {
    setIsLoading(true);
    try {
      return await authService.verifyEmail(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user || !user.role) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permissions: string | string[]): boolean => {
      if (!user || !user.permissions) return false;
      const userPermissions = (user.permissions || []) as string[];

      if (userPermissions.includes('read:all') || userPermissions.includes('write:all')) {
        return true;
      }

      if (Array.isArray(permissions)) {
        return permissions.some((p) => userPermissions.includes(p));
      }
      return userPermissions.includes(permissions);
    },
    [user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithGitHub,
    signUp,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    logout,
    hasRole,
    hasPermission,
  };
};
