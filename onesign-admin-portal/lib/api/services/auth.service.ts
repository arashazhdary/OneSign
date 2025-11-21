import { ApiClient, apiClient } from '../api-client';
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  MfaSetupRequest,
  MfaSetupResponse,
  MfaVerifyRequest,
  MfaEnableRequest,
  SessionInfo,
  RevokeSessionRequest,
  OAuth2AuthorizeRequest,
  OAuth2CallbackRequest,
  SamlConfigRequest,
} from '../types/auth';

/**
 * Authentication Service
 * Handles all authentication and authorization operations
 */
export class AuthService {
  constructor(private client: ApiClient = apiClient) {}

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInRequest): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>('/api/auth/signin', data);
    return response.data;
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    const response = await this.client.post<SignUpResponse>('/api/auth/signup', data);
    return response.data;
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await this.client.post('/api/auth/signout');
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.client.post<RefreshTokenResponse>('/api/auth/refresh', data);
    return response.data;
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.client.post('/api/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.client.post('/api/auth/reset-password', data);
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.client.post('/api/auth/change-password', data);
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await this.client.post('/api/auth/verify-email', data);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await this.client.post('/api/auth/resend-verification', { email });
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<any>): Promise<any> {
    const response = await this.client.put('/api/auth/profile', data);
    return response.data;
  }

  // MFA Operations

  /**
   * Setup MFA for user
   */
  async setupMfa(data: MfaSetupRequest): Promise<MfaSetupResponse> {
    const response = await this.client.post<MfaSetupResponse>('/api/auth/mfa/setup', data);
    return response.data;
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(data: MfaVerifyRequest): Promise<{ verified: boolean }> {
    const response = await this.client.post<{ verified: boolean }>('/api/auth/mfa/verify', data);
    return response.data;
  }

  /**
   * Enable MFA
   */
  async enableMfa(data: MfaEnableRequest): Promise<void> {
    await this.client.post('/api/auth/mfa/enable', data);
  }

  /**
   * Disable MFA
   */
  async disableMfa(userId: string): Promise<void> {
    await this.client.post('/api/auth/mfa/disable', { userId });
  }

  /**
   * Get MFA status
   */
  async getMfaStatus(userId: string): Promise<{ enabled: boolean; methods: string[] }> {
    const response = await this.client.get(`/api/auth/mfa/status`, { userId });
    return response.data;
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(userId: string): Promise<{ codes: string[] }> {
    const response = await this.client.post<{ codes: string[] }>('/api/auth/mfa/backup-codes', {
      userId,
    });
    return response.data;
  }

  // Session Management

  /**
   * Get active sessions
   */
  async getSessions(userId: string): Promise<SessionInfo[]> {
    const response = await this.client.get<SessionInfo[]>('/api/auth/sessions', { userId });
    return response.data;
  }

  /**
   * Revoke a session
   */
  async revokeSession(data: RevokeSessionRequest): Promise<void> {
    await this.client.post('/api/auth/sessions/revoke', data);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.client.post('/api/auth/sessions/revoke-all', { userId });
  }

  // OAuth2 / SSO

  /**
   * Get OAuth2 authorization URL
   */
  async getOAuth2AuthUrl(data: OAuth2AuthorizeRequest): Promise<{ authUrl: string }> {
    const response = await this.client.post<{ authUrl: string }>('/api/auth/oauth2/authorize', data);
    return response.data;
  }

  /**
   * Handle OAuth2 callback
   */
  async handleOAuth2Callback(data: OAuth2CallbackRequest): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>('/api/auth/oauth2/callback', data);
    return response.data;
  }

  /**
   * Configure SAML SSO
   */
  async configureSaml(tenantId: string, data: SamlConfigRequest): Promise<void> {
    await this.client.post('/api/auth/saml/configure', { ...data, tenantId });
  }

  /**
   * Get SAML metadata
   */
  async getSamlMetadata(tenantId: string): Promise<string> {
    const response = await this.client.get<string>('/api/auth/saml/metadata', { tenantId });
    return response.data;
  }

  // Token Management

  /**
   * Validate access token
   */
  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    const response = await this.client.post<{ valid: boolean; user?: any }>(
      '/api/auth/validate-token',
      { token }
    );
    return response.data;
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    await this.client.post('/api/auth/revoke-token', { token });
  }
}

// Export singleton instance
export const authService = new AuthService();
