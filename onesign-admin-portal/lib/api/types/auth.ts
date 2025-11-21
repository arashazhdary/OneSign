/**
 * Authentication related types
 */

export interface SignInRequest {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
  requiresMfa?: boolean;
  mfaSessionId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  tenants: TenantAccess[];
}

export interface TenantAccess {
  tenantId: string;
  tenantName: string;
  role: string;
  permissions: string[];
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  phone?: string;
}

export interface SignUpResponse {
  userId: string;
  email: string;
  requiresEmailVerification: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface MfaSetupRequest {
  userId: string;
  method: 'totp' | 'sms' | 'email';
}

export interface MfaSetupResponse {
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export interface MfaVerifyRequest {
  userId: string;
  code: string;
  method: 'totp' | 'sms' | 'email';
}

export interface MfaEnableRequest {
  userId: string;
  verificationCode: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface RevokeSessionRequest {
  sessionId: string;
}

export interface OAuth2AuthorizeRequest {
  provider: 'google' | 'microsoft' | 'github';
  redirectUri: string;
  state?: string;
}

export interface OAuth2CallbackRequest {
  code: string;
  state?: string;
}

export interface SamlConfigRequest {
  entityId: string;
  ssoUrl: string;
  certificate: string;
}

export interface GoogleLoginRequest {
  code: string;
  redirectUri: string;
}

export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
  requiresPasswordSetup?: boolean;
  setupToken?: string;
}

export interface CompleteFirstLoginRequest {
  setupToken: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteFirstLoginResponse {
  success: boolean;
  message: string;
}
