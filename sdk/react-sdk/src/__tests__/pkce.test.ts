import { generateCodeVerifier, generateCodeChallenge, exchangeCodeForToken } from '../utils/pkce';
import { OnesignConfig } from '../types';

// Mock crypto API
const mockGetRandomValues = jest.fn();
const mockDigest = jest.fn();

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockGetRandomValues,
    subtle: {
      digest: mockDigest,
    },
  },
});

// Mock btoa
global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));

// Mock fetch
global.fetch = jest.fn();

describe('pkce utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCodeVerifier', () => {
    it('should generate a code verifier with correct length', () => {
      const mockArray = new Uint8Array(32).fill(1);
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockArray);
        return array;
      });

      const result = generateCodeVerifier();

      expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate base64url encoded string without padding', () => {
      const mockArray = new Uint8Array(32).fill(65); // 'A' character
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockArray);
        return array;
      });

      const result = generateCodeVerifier();

      // Should not contain base64 padding or URL-unsafe characters
      expect(result).not.toContain('=');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });

    it('should replace + with - in base64url encoding', () => {
      // Create array that would produce + in base64
      const mockArray = new Uint8Array([62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62]);
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockArray);
        return array;
      });

      const result = generateCodeVerifier();
      expect(result).not.toContain('+');
    });

    it('should replace / with _ in base64url encoding', () => {
      // Create array that would produce / in base64
      const mockArray = new Uint8Array([63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63]);
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        array.set(mockArray);
        return array;
      });

      const result = generateCodeVerifier();
      expect(result).not.toContain('/');
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate a code challenge from verifier', async () => {
      const mockHash = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
      mockDigest.mockResolvedValue(mockHash.buffer);

      const codeVerifier = 'test-code-verifier';
      const result = await generateCodeChallenge(codeVerifier);

      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use SHA-256 algorithm', async () => {
      const mockHash = new Uint8Array(32).fill(0);
      mockDigest.mockResolvedValue(mockHash.buffer);

      await generateCodeChallenge('verifier');

      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
    });

    it('should encode the verifier using TextEncoder', async () => {
      const mockHash = new Uint8Array(32).fill(0);
      mockDigest.mockResolvedValue(mockHash.buffer);

      const verifier = 'test-verifier';
      await generateCodeChallenge(verifier);

      // The first argument to digest should be the encoded verifier
      const call = mockDigest.mock.calls[0];
      const encodedData = call[1];

      // TextEncoder encodes each character
      expect(encodedData).toBeInstanceOf(Uint8Array);
    });

    it('should return base64url encoded result without padding', async () => {
      const mockHash = new Uint8Array(32).fill(255);
      mockDigest.mockResolvedValue(mockHash.buffer);

      const result = await generateCodeChallenge('verifier');

      expect(result).not.toContain('=');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });
  });

  describe('exchangeCodeForToken', () => {
    const mockConfig: OnesignConfig = {
      baseUrl: 'https://auth.example.com',
      clientId: 'test-client-id',
      redirectUri: 'https://app.example.com/callback',
    };

    const mockTokenResponse = {
      access_token: 'test-access-token',
      id_token: 'test-id-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    it('should exchange code for token successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result).toEqual({
        accessToken: 'test-access-token',
        idToken: 'test-id-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
    });

    it('should call fetch with correct URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://auth.example.com/connect/token',
        expect.any(Object)
      );
    });

    it('should send correct form data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];
      const body = requestOptions.body;

      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth-code');
      expect(body).toContain('redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback');
      expect(body).toContain('client_id=test-client-id');
      expect(body).toContain('code_verifier=code-verifier');
    });

    it('should use POST method with correct headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestOptions = fetchCall[1];

      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    });

    it('should return null on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result).toBeNull();
    });

    it('should return null and log error on fetch failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error exchanging code for token:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle missing token_type with default value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test-access-token',
          id_token: 'test-id-token',
        }),
      });

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result?.tokenType).toBe('Bearer');
    });

    it('should handle missing expires_in with default value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test-access-token',
          id_token: 'test-id-token',
        }),
      });

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result?.expiresIn).toBe(3600);
    });

    it('should trim trailing slash from baseUrl', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const configWithSlash: OnesignConfig = {
        ...mockConfig,
        baseUrl: 'https://auth.example.com/',
      };

      await exchangeCodeForToken(configWithSlash, 'auth-code', 'code-verifier');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://auth.example.com/connect/token',
        expect.any(Object)
      );
    });

    it('should handle json parsing error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await exchangeCodeForToken(mockConfig, 'auth-code', 'code-verifier');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
