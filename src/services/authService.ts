import { apiClient } from './apiClient';
import { tokenStorage } from '../utils/tokenStorage';
import { API_CONFIG } from '../config/apiConfig';
import {
  LoginRequest,
  LoginResponse,
  User,
  Token,
  DecodedToken,
  AuthResponse,
  Role,
  Permission,
} from '../types/authTypes';
import { APIResponse } from '../types/apiTypes';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.currentUser = tokenStorage.getStoredUser();
  }

  private buildDefaultUser(username: string, role: Role = 'SuperAdmin'): User {
    const permissions: Permission[] =
      role === 'SuperAdmin' || role === 'Admin' || role === 'Dean'
        ? ['read:all', 'write:all', 'delete:all', 'read:students', 'write:students', 'delete:students', 'read:finance', 'write:finance', 'approve:refund', 'read:academics', 'write:academics']
        : ['read:students', 'read:academics', 'read:finance'];

    return {
      id: `usr-${username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      username,
      email: `${username}@institution.edu`,
      name: username === 'user' ? 'Institutional Administrator' : username,
      role,
      permissions,
      department: 'Academic & Financial Administration',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
    };
  }

  public async login(credentials: LoginRequest): Promise<APIResponse<LoginResponse>> {
    const rememberMe = credentials.rememberMe !== false;

    // 1. Standalone Mock Mode for development when specified in .env
    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));

      const mockUser = this.buildDefaultUser(credentials.username || 'admin.rajesh', 'SuperAdmin');
      const mockToken: Token = {
        accessToken: `mock_jwt_access_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        issuedAt: Date.now(),
      };

      const loginData: LoginResponse = { user: mockUser, token: mockToken };
      tokenStorage.saveToken(mockToken, rememberMe);
      tokenStorage.setStoredUser(mockUser, rememberMe);
      this.currentUser = mockUser;

      return {
        success: true,
        data: loginData,
        message: 'Authentication successful (Mock Mode)',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Real Spring Boot Backend Endpoint: /auth/login
    // Spring Boot AuthController returns ResponseEntity<AuthResponse> with { accessToken, refreshToken }
    const rawResponse = await apiClient.post<AuthResponse | LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        username: credentials.username,
        password: credentials.password,
      },
      { skipAuth: true }
    );

    if (rawResponse.success && rawResponse.data) {
      const responsePayload = rawResponse.data as any;

      // Extract tokens whether backend returned raw AuthResponse or wrapped LoginResponse
      const accessToken: string =
        responsePayload.accessToken || responsePayload.token?.accessToken;
      const refreshToken: string =
        responsePayload.refreshToken || responsePayload.token?.refreshToken;

      if (!accessToken) {
        throw new Error('No access token returned by authentication gateway');
      }

      // Save credentials in storage
      const authTokens: AuthResponse = {
        accessToken,
        refreshToken: refreshToken || '',
        tokenType: 'Bearer',
        expiresIn: 15 * 60, // 15 mins (Spring Boot JwtService default)
      };
      tokenStorage.saveAuthResponse(authTokens, rememberMe);

      // Decode JWT payload to obtain user claims
      const decoded = tokenStorage.decodeToken<DecodedToken>(accessToken);
      const username = decoded?.sub || decoded?.username || credentials.username;
      const role: Role = decoded?.role || (username === 'admin' ? 'SuperAdmin' : 'SuperAdmin');

      const user: User = responsePayload.user || this.buildDefaultUser(username, role);
      tokenStorage.setStoredUser(user, rememberMe);
      this.currentUser = user;

      const tokenObj: Token = {
        accessToken,
        refreshToken: refreshToken || '',
        tokenType: 'Bearer',
        expiresIn: 15 * 60,
        issuedAt: Date.now(),
      };

      return {
        success: true,
        data: { user, token: tokenObj },
        message: 'Authentication successful. Connected to Spring Boot.',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      data: null,
      message: rawResponse.message || 'Authentication failed',
      code: rawResponse.code || 401,
      timestamp: new Date().toISOString(),
    };
  }

  public async logout(): Promise<void> {
    try {
      if (!API_CONFIG.USE_MOCK && this.isAuthenticated()) {
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, { skipAuth: false });
      }
    } catch (err) {
      console.warn('[AuthService] Logout notification to backend failed:', err);
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
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 86400,
        issuedAt: Date.now(),
      };
      tokenStorage.saveToken(newToken);
      return {
        success: true,
        data: newToken,
        message: 'Access token refreshed successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    // Call Spring Boot /auth/refresh with { refreshToken }
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { skipAuth: true }
    );

    if (response.success && response.data?.accessToken) {
      const authTokens: AuthResponse = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60,
      };
      tokenStorage.saveAuthResponse(authTokens);

      const tokenObj: Token = {
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60,
        issuedAt: Date.now(),
      };

      return {
        success: true,
        data: tokenObj,
        message: 'Access token refreshed successfully',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Failed to refresh authentication token');
  }

  public async getCurrentUser(): Promise<APIResponse<User>> {
    if (this.currentUser) {
      return {
        success: true,
        data: this.currentUser,
        message: 'Current user retrieved from active session',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const storedUser = tokenStorage.getStoredUser();
    if (storedUser) {
      this.currentUser = storedUser;
      return {
        success: true,
        data: storedUser,
        message: 'User restored from stored session',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const accessToken = tokenStorage.getAccessToken();
    if (accessToken && !tokenStorage.isTokenExpired(accessToken)) {
      const decoded = tokenStorage.decodeToken<DecodedToken>(accessToken);
      if (decoded?.sub) {
        const user = this.buildDefaultUser(decoded.sub, decoded.role || 'SuperAdmin');
        this.currentUser = user;
        tokenStorage.setStoredUser(user);
        return {
          success: true,
          data: user,
          message: 'User session restored from valid JWT claims',
          code: 200,
          timestamp: new Date().toISOString(),
        };
      }
    }

    return {
      success: false,
      data: null,
      message: 'No authenticated session found',
      code: 401,
      timestamp: new Date().toISOString(),
    };
  }

  public isAuthenticated(): boolean {
    return tokenStorage.validateToken();
  }

  public removeToken(): void {
    tokenStorage.clearTokens();
    this.currentUser = null;
  }

  public decodeToken(): DecodedToken | null {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;
    return tokenStorage.decodeToken<DecodedToken>(token);
  }
}

export const authService = new AuthService();
