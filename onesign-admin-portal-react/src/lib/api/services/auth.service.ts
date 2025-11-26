// Auth Service - API methods for authentication
// Based on OneSign Technical Specification

import apiClient from '@/services/apiClient';

// Types
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  user: UserInfoDto;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface UserInfoDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  tenantName?: string;
  isFirstLogin?: boolean;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CompleteFirstLoginDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  acceptTerms: boolean;
  setupMfa?: boolean;
}

export interface MfaVerifyDto {
  mfaToken: string;
  code: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

// Auth Service
export const authService = {
  // ==================== LOGIN/LOGOUT ====================

  /**
   * POST /api/auth/login - ورود کاربر
   */
  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  /**
   * POST /api/auth/logout - خروج کاربر
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * POST /api/auth/refresh - بازیابی توکن
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * POST /api/auth/forgot-password - درخواست بازنشانی رمزعبور
   */
  forgotPassword: async (data: ForgotPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  /**
   * POST /api/auth/reset-password - بازنشانی رمزعبور
   */
  resetPassword: async (data: ResetPasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },

  /**
   * POST /api/auth/change-password - تغییر رمزعبور
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // ==================== FIRST LOGIN ====================

  /**
   * POST /api/auth/complete-first-login - تکمیل ورود اول
   */
  completeFirstLogin: async (data: CompleteFirstLoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/api/auth/complete-first-login', data);
    return response.data;
  },

  // ==================== MFA ====================

  /**
   * POST /api/auth/mfa/verify - تایید MFA
   */
  verifyMfa: async (data: MfaVerifyDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/api/auth/mfa/verify', data);
    return response.data;
  },

  /**
   * POST /api/auth/mfa/setup - راه‌اندازی MFA
   */
  setupMfa: async (): Promise<{ qrCode: string; secret: string }> => {
    const response = await apiClient.post('/api/auth/mfa/setup');
    return response.data;
  },

  /**
   * POST /api/auth/mfa/enable - فعال‌سازی MFA
   */
  enableMfa: async (code: string): Promise<{ backupCodes: string[] }> => {
    const response = await apiClient.post('/api/auth/mfa/enable', { code });
    return response.data;
  },

  /**
   * POST /api/auth/mfa/disable - غیرفعال‌سازی MFA
   */
  disableMfa: async (code: string): Promise<void> => {
    await apiClient.post('/api/auth/mfa/disable', { code });
  },

  // ==================== SOCIAL LOGIN ====================

  /**
   * POST /api/auth/google-login - ورود با گوگل
   */
  googleLogin: async (data: GoogleLoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/api/auth/google-login', data);
    return response.data;
  },

  /**
   * POST /api/auth/microsoft-login - ورود با مایکروسافت
   */
  microsoftLogin: async (idToken: string): Promise<LoginResponseDto> => {
    const response = await apiClient.post('/api/auth/microsoft-login', { idToken });
    return response.data;
  },

  // ==================== USER INFO ====================

  /**
   * GET /api/userinfo - اطلاعات کاربر جاری
   */
  getUserInfo: async (): Promise<UserInfoDto | null> => {
    try {
      const response = await apiClient.get('/api/userinfo');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  },

  /**
   * GET /api/auth/me - اطلاعات کاربر جاری (آلترناتیو)
   */
  getCurrentUser: async (): Promise<UserInfoDto | null> => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  },

  // ==================== SESSION ====================

  /**
   * GET /api/auth/sessions - لیست نشست‌های فعال
   */
  getActiveSessions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/api/auth/sessions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      return [];
    }
  },

  /**
   * DELETE /api/auth/sessions/{id} - پایان دادن به نشست
   */
  terminateSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/auth/sessions/${sessionId}`);
  },

  /**
   * POST /api/auth/sessions/terminate-all - پایان دادن به همه نشست‌ها
   */
  terminateAllSessions: async (): Promise<void> => {
    await apiClient.post('/api/auth/sessions/terminate-all');
  },
};

export default authService;
