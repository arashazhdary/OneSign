export interface OnesignConfig {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  tenantId?: string;
}

export interface TokenInfo {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
}

