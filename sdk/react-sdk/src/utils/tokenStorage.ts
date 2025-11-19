import { TokenInfo, UserInfo, StorageType } from '../types';

const TOKEN_KEY = 'onesign_tokens';
const USER_KEY = 'onesign_user';
const VERIFIER_KEY = 'onesign_code_verifier';

export interface TokenStorageOptions {
  type: StorageType;
  prefix?: string;
}

export class TokenStorage {
  private storage: Storage;
  private prefix: string;

  constructor(options: TokenStorageOptions = { type: 'sessionStorage' }) {
    this.storage = options.type === 'localStorage' ? localStorage : sessionStorage;
    this.prefix = options.prefix || '';
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  getTokens(): TokenInfo | null {
    try {
      const data = this.storage.getItem(this.getKey(TOKEN_KEY));
      if (!data) return null;

      const tokens = JSON.parse(data) as TokenInfo & { expiresAt?: number };

      if (tokens.expiresAt && Date.now() > tokens.expiresAt) {
        this.clearTokens();
        return null;
      }

      return tokens;
    } catch {
      return null;
    }
  }

  setTokens(tokens: TokenInfo): void {
    const storageData = {
      ...tokens,
      expiresAt: Date.now() + (tokens.expiresIn * 1000)
    };
    this.storage.setItem(this.getKey(TOKEN_KEY), JSON.stringify(storageData));
  }

  clearTokens(): void {
    this.storage.removeItem(this.getKey(TOKEN_KEY));
  }

  getUser(): UserInfo | null {
    try {
      const data = this.storage.getItem(this.getKey(USER_KEY));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setUser(user: UserInfo): void {
    this.storage.setItem(this.getKey(USER_KEY), JSON.stringify(user));
  }

  clearUser(): void {
    this.storage.removeItem(this.getKey(USER_KEY));
  }

  getCodeVerifier(): string | null {
    return this.storage.getItem(this.getKey(VERIFIER_KEY));
  }

  setCodeVerifier(verifier: string): void {
    this.storage.setItem(this.getKey(VERIFIER_KEY), verifier);
  }

  clearCodeVerifier(): void {
    this.storage.removeItem(this.getKey(VERIFIER_KEY));
  }

  clearAll(): void {
    this.clearTokens();
    this.clearUser();
    this.clearCodeVerifier();
  }

  isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;

    const data = this.storage.getItem(this.getKey(TOKEN_KEY));
    if (!data) return true;

    try {
      const parsed = JSON.parse(data);
      return parsed.expiresAt ? Date.now() > parsed.expiresAt : false;
    } catch {
      return true;
    }
  }

  getTokenExpirationTime(): number | null {
    const data = this.storage.getItem(this.getKey(TOKEN_KEY));
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return parsed.expiresAt || null;
    } catch {
      return null;
    }
  }
}

export function createTokenStorage(options?: TokenStorageOptions): TokenStorage {
  return new TokenStorage(options);
}
