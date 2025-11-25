import apiClient from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
}

class AuthApi {
  private basePath = '/auth';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post(`${this.basePath}/login`, credentials);
  }

  async logout(): Promise<void> {
    return apiClient.post(`${this.basePath}/logout`);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post(`${this.basePath}/refresh`, { refreshToken });
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return apiClient.post(`${this.basePath}/forgot-password`, data);
  }

  async resetPassword(data: PasswordReset): Promise<void> {
    return apiClient.post(`${this.basePath}/reset-password`, data);
  }

  async verifyEmail(token: string): Promise<void> {
    return apiClient.post(`${this.basePath}/verify-email`, { token });
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return apiClient.get(`${this.basePath}/me`);
  }
}

export const authApi = new AuthApi();
