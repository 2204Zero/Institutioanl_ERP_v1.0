import { Token, DecodedToken } from '../types/authTypes';

const ACCESS_TOKEN_KEY = 'erp_access_token';
const REFRESH_TOKEN_KEY = 'erp_refresh_token';
const TOKEN_METADATA_KEY = 'erp_token_meta';

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setAccessToken(token: string, rememberMe: boolean = true): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (err) {
      console.warn('Failed to save access token in storage:', err);
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string, rememberMe: boolean = true): void {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (err) {
      console.warn('Failed to save refresh token in storage:', err);
    }
  },

  saveToken(tokens: Token, rememberMe: boolean = true): void {
    this.setAccessToken(tokens.accessToken, rememberMe);
    this.setRefreshToken(tokens.refreshToken, rememberMe);
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_METADATA_KEY, JSON.stringify(tokens));
    } catch {
      // Ignore storage error
    }
  },

  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_METADATA_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_METADATA_KEY);
    } catch (err) {
      console.warn('Failed to clear tokens from storage:', err);
    }
  },

  decodeToken<T = DecodedToken>(token: string): T | null {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Fallback for mock tokens
        const decoded = atob(token);
        return JSON.parse(decoded) as T;
      }
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(payload)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as T;
    } catch {
      return null;
    }
  },

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    const decoded = this.decodeToken<DecodedToken>(token);
    if (!decoded || !decoded.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime;
  },

  validateToken(token?: string | null): boolean {
    const targetToken = token || this.getAccessToken();
    if (!targetToken) return false;
    return !this.isTokenExpired(targetToken);
  },
};
