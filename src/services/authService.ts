import { apiClient } from './apiClient';
import { tokenStorage } from '../utils/tokenStorage';
import { API_CONFIG } from '../config/apiConfig';
import {
  LoginRequest,
  SignUpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  LoginResponse,
  User,
  Token,
  DecodedToken,
  AuthResponse,
  Role,
  Permission,
  UserSession,
} from '../types/authTypes';
import { APIResponse } from '../types/apiTypes';

class AuthService {
  private currentUser: User | null = null;
  private activeSessions: UserSession[] = [
    {
      id: 'sess-1',
      sessionId: 'SID-2026-9012',
      userId: 'usr-admin-rajesh',
      device: {
        id: 'dev-1',
        deviceName: 'Workstation Mac Book Pro',
        browser: 'Chrome 128.0',
        os: 'macOS Sonoma',
        ipAddress: '192.168.1.102',
        lastActiveAt: new Date().toISOString(),
        isCurrentDevice: true,
      },
      loginAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 82800000).toISOString(),
      isActive: true,
    },
    {
      id: 'sess-2',
      sessionId: 'SID-2026-9013',
      userId: 'usr-admin-rajesh',
      device: {
        id: 'dev-2',
        deviceName: 'iPhone 15 Pro Max',
        browser: 'Mobile Safari 17.4',
        os: 'iOS 17.4',
        ipAddress: '10.0.4.15',
        lastActiveAt: new Date(Date.now() - 7200000).toISOString(),
        isCurrentDevice: false,
      },
      loginAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() + 79200000).toISOString(),
      isActive: true,
    },
  ];

  constructor() {
    this.currentUser = tokenStorage.getStoredUser();
  }

  private buildDefaultUser(
    username: string,
    role: Role = 'SuperAdmin',
    provider: User['provider'] = 'credentials',
    email?: string,
    name?: string,
    avatarUrl?: string
  ): User {
    const permissions: Permission[] =
      role === 'SuperAdmin' || role === 'Admin' || role === 'Dean'
        ? [
            'read:all',
            'write:all',
            'delete:all',
            'read:students',
            'write:students',
            'delete:students',
            'read:finance',
            'write:finance',
            'approve:refund',
            'read:academics',
            'write:academics',
            'manage:users',
            'manage:roles',
            'read:audit',
            'write:audit',
          ]
        : ['read:students', 'read:academics', 'read:finance'];

    return {
      id: `usr-${username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      username,
      email: email || `${username}@institution.edu`,
      name: name || (username === 'user' ? 'Institutional Administrator' : username),
      role,
      permissions,
      department: 'Academic & Financial Administration',
      avatarUrl:
        avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      isEmailVerified: true,
      failedLoginAttempts: 0,
      isAccountLocked: false,
      provider,
    };
  }

  public async login(credentials: LoginRequest): Promise<APIResponse<LoginResponse>> {
    const rememberMe = credentials.rememberMe !== false;
    const selectedRole: Role = credentials.role || (localStorage.getItem('selectedRole') as Role) || 'SuperAdmin';

    if (API_CONFIG.USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));

      const mockUser = this.buildDefaultUser(credentials.username || 'admin.rajesh', selectedRole, 'credentials');
      const mockToken: Token = {
        accessToken: `mock_jwt_access_${Date.now()}`,
        refreshToken: `mock_jwt_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        issuedAt: Date.now(),
      };

      const loginData: LoginResponse = { user: mockUser, token: mockToken, sessions: this.activeSessions };
      tokenStorage.saveToken(mockToken, rememberMe);
      tokenStorage.setStoredUser(mockUser, rememberMe);
      this.currentUser = mockUser;

      return {
        success: true,
        data: loginData,
        message: 'Authentication successful (Enterprise Mode)',
        code: 200,
        timestamp: new Date().toISOString(),
      };
    }

    const rawResponse = await apiClient.post<AuthResponse | LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        username: credentials.username,
        password: credentials.password,
        role: selectedRole,
      },
      { skipAuth: true }
    );

    if (rawResponse.success && rawResponse.data) {
      const responsePayload = rawResponse.data as any;

      const accessToken: string =
        responsePayload.accessToken || responsePayload.token?.accessToken;
      const refreshToken: string =
        responsePayload.refreshToken || responsePayload.token?.refreshToken;

      if (!accessToken) {
        throw new Error('No access token returned by authentication gateway');
      }

      const authTokens: AuthResponse = {
        accessToken,
        refreshToken: refreshToken || '',
        tokenType: 'Bearer',
        expiresIn: 15 * 60,
      };
      tokenStorage.saveAuthResponse(authTokens, rememberMe);

      const decoded = tokenStorage.decodeToken<DecodedToken>(accessToken);
      const username = decoded?.sub || decoded?.username || credentials.username;
      const role: Role = decoded?.role || selectedRole;

      const user: User = responsePayload.user || this.buildDefaultUser(username, role, 'credentials');
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
        data: { user, token: tokenObj, sessions: this.activeSessions },
        message: 'Authentication successful. Connected to Backend.',
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

  public async loginWithGoogle(): Promise<APIResponse<LoginResponse>> {
    await new Promise((res) => setTimeout(res, 400));
    const googleUser = this.buildDefaultUser(
      'alex.mercer',
      'Faculty',
      'google',
      'alex.mercer@gmail.com',
      'Dr. Alex Mercer',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    );
    const mockToken: Token = {
      accessToken: `mock_google_jwt_${Date.now()}`,
      refreshToken: `mock_google_refresh_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      issuedAt: Date.now(),
    };
    tokenStorage.saveToken(mockToken);
    tokenStorage.setStoredUser(googleUser);
    this.currentUser = googleUser;

    return {
      success: true,
      data: { user: googleUser, token: mockToken, sessions: this.activeSessions },
      message: 'Signed in successfully via Google OAuth 2.0',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async loginWithMicrosoft(): Promise<APIResponse<LoginResponse>> {
    await new Promise((res) => setTimeout(res, 400));
    const msUser = this.buildDefaultUser(
      'sarah.connor',
      'Dean',
      'microsoft',
      'sarah.connor@institution.edu',
      'Dr. Sarah Connor',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    );
    const mockToken: Token = {
      accessToken: `mock_ms_jwt_${Date.now()}`,
      refreshToken: `mock_ms_refresh_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      issuedAt: Date.now(),
    };
    tokenStorage.saveToken(mockToken);
    tokenStorage.setStoredUser(msUser);
    this.currentUser = msUser;

    return {
      success: true,
      data: { user: msUser, token: mockToken, sessions: this.activeSessions },
      message: 'Signed in successfully via Microsoft Azure AD',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async loginWithGitHub(): Promise<APIResponse<LoginResponse>> {
    await new Promise((res) => setTimeout(res, 400));
    const ghUser = this.buildDefaultUser(
      'dev.lead',
      'SuperAdmin',
      'github',
      'lead.dev@github.com',
      'Enterprise Engineering Lead',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100'
    );
    const mockToken: Token = {
      accessToken: `mock_gh_jwt_${Date.now()}`,
      refreshToken: `mock_gh_refresh_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      issuedAt: Date.now(),
    };
    tokenStorage.saveToken(mockToken);
    tokenStorage.setStoredUser(ghUser);
    this.currentUser = ghUser;

    return {
      success: true,
      data: { user: ghUser, token: mockToken, sessions: this.activeSessions },
      message: 'Signed in successfully via GitHub OAuth',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async signUp(data: SignUpRequest): Promise<APIResponse<LoginResponse>> {
    await new Promise((res) => setTimeout(res, 400));
    const newUser = this.buildDefaultUser(
      data.username,
      data.role || 'Student',
      'credentials',
      data.email,
      data.fullName
    );
    const mockToken: Token = {
      accessToken: `mock_signup_jwt_${Date.now()}`,
      refreshToken: `mock_signup_refresh_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      issuedAt: Date.now(),
    };
    tokenStorage.saveToken(mockToken);
    tokenStorage.setStoredUser(newUser);
    this.currentUser = newUser;

    return {
      success: true,
      data: { user: newUser, token: mockToken, sessions: this.activeSessions },
      message: 'Institutional account created successfully',
      code: 201,
      timestamp: new Date().toISOString(),
    };
  }

  public async requestPasswordReset(req: ForgotPasswordRequest): Promise<APIResponse<boolean>> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      data: true,
      message: `Password reset link sent to ${req.email}`,
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async resetPassword(req: ResetPasswordRequest): Promise<APIResponse<boolean>> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      data: true,
      message: 'Password updated successfully. You may now log in with your new credentials.',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async changePassword(req: ChangePasswordRequest): Promise<APIResponse<boolean>> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      data: true,
      message: 'Your account password has been updated successfully across all active devices.',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async verifyEmail(req: VerifyEmailRequest): Promise<APIResponse<boolean>> {
    await new Promise((res) => setTimeout(res, 300));
    return {
      success: true,
      data: true,
      message: `Email address ${req.email} verified successfully.`,
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async getUserActiveSessions(): Promise<APIResponse<UserSession[]>> {
    return {
      success: true,
      data: this.activeSessions,
      message: 'Retrieved active sessions list',
      code: 200,
      timestamp: new Date().toISOString(),
    };
  }

  public async terminateSession(sessionId: string): Promise<APIResponse<boolean>> {
    this.activeSessions = this.activeSessions.filter((s) => s.id !== sessionId);
    return {
      success: true,
      data: true,
      message: `Session ${sessionId} terminated successfully`,
      code: 200,
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
