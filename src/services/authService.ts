import { apiClient } from './apiClient';
import { tokenStorage } from '../utils/tokenStorage';
import { API_CONFIG } from '../config/apiConfig';
import {
  LoginRequest,
  LoginResponse,
  User,
  Token,
  DecodedToken,
} from '../types/authTypes';
import { APIResponse } from '../types/apiTypes';

class AuthService {
  private currentUser: User | null = null;

  public async login(credentials: LoginRequest): Promise<APIResponse<LoginResponse>> {
    if (API_CONFIG.USE_MOCK) {
      // Production-grade mock provider for standalone operation
      await new Promise((res) => setTimeout(res, 400));

      const mockUser: User = {
        id: 'usr-admin-01',
        username: credentials.username || 'admin.rajesh',
        email: 'rajesh.kumar@nits.edu',
        name: 'Dr. Rajesh Kumar',
        role: 'Dean',
        permissions: ['read:all', 'write:all', 'approve:refund', 'write:finance'],
        department: 'Academic Affairs',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        lastLoginAt: new Date().toISOString(),
        isActive: true,
      };

      const mockToken: Token = {
        accessToken: `mock_jwt_access_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400, // 24 hours
        issuedAt: Date.now(),
      };

      const loginData: LoginResponse = { user: mockUser, token: mockToken };

      this.saveToken(mockToken, credentials.rememberMe);
      this.currentUser = mockUser;

      return {
        success: true,
        data: loginData,
        message: 'Authentication successful. Welcome to EdERP Suite.',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiClient.post<LoginResponse>('/auth/login', credentials, { skipAuth: true });
    if (response.success && response.data?.token) {
      this.saveToken(response.data.token, credentials.rememberMe);
      this.currentUser = response.data.user;
    }
    return response;
  }

  public async logout(): Promise<void> {
    try {
      if (!API_CONFIG.USE_MOCK && this.isAuthenticated()) {
        await apiClient.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout notification request failed:', err);
    } finally {
      this.removeToken();
      this.currentUser = null;
    }
  }

  public async refreshToken(): Promise<APIResponse<Token>> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const newToken: Token = {
        accessToken: `mock_jwt_access_refreshed_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        issuedAt: Date.now(),
      };
      this.saveToken(newToken);
      return {
        success: true,
        data: newToken,
        message: 'Access token refreshed successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiClient.post<Token>('/auth/refresh-token', { refreshToken }, { skipAuth: true });
    if (response.success && response.data) {
      this.saveToken(response.data);
    }
    return response;
  }

  public async getCurrentUser(): Promise<APIResponse<User>> {
    if (this.currentUser) {
      return {
        success: true,
        data: this.currentUser,
        message: 'Current user retrieved from session state',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    if (API_CONFIG.USE_MOCK) {
      const mockUser: User = {
        id: 'usr-admin-01',
        username: 'admin.rajesh',
        email: 'rajesh.kumar@nits.edu',
        name: 'Dr. Rajesh Kumar',
        role: 'Dean',
        permissions: ['read:all', 'write:all', 'approve:refund', 'write:finance'],
        department: 'Academic Affairs',
        lastLoginAt: new Date().toISOString(),
        isActive: true,
      };
      this.currentUser = mockUser;
      return {
        success: true,
        data: mockUser,
        message: 'Current user retrieved successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiClient.get<User>('/auth/me');
    if (response.success && response.data) {
      this.currentUser = response.data;
    }
    return response;
  }

  public isAuthenticated(): boolean {
    return tokenStorage.validateToken();
  }

  public saveToken(token: Token, rememberMe: boolean = true): void {
    tokenStorage.saveToken(token, rememberMe);
  }

  public removeToken(): void {
    tokenStorage.clearTokens();
  }

  public decodeToken(): DecodedToken | null {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;
    return tokenStorage.decodeToken<DecodedToken>(token);
  }

  public validateToken(): boolean {
    return tokenStorage.validateToken();
  }
}

export const authService = new AuthService();
