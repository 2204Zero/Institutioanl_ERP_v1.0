import { tokenStorage } from './tokenStorage';
import { DecodedToken } from '../types/authTypes';

export { tokenStorage };

export const getAuthToken = (): string | null => tokenStorage.getAccessToken();

export const setAuthToken = (token: string, rememberMe: boolean = true): void => {
  tokenStorage.setAccessToken(token, rememberMe);
};

export const getRefreshToken = (): string | null => tokenStorage.getRefreshToken();

export const setRefreshToken = (token: string, rememberMe: boolean = true): void => {
  tokenStorage.setRefreshToken(token, rememberMe);
};

export const clearAuthTokens = (): void => {
  tokenStorage.clearTokens();
};

export const isTokenExpired = (token?: string | null): boolean => {
  if (!token) return true;
  return tokenStorage.isTokenExpired(token);
};

export const decodeJwtToken = <T = DecodedToken>(token: string): T | null => {
  return tokenStorage.decodeToken<T>(token);
};

export const formatBearerToken = (token?: string | null): string => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};
