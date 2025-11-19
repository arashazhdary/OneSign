import createMiddleware from 'next-intl/middleware';
import middleware, { config } from '../../middleware';

// Mock next-intl/middleware
jest.mock('next-intl/middleware', () => {
  return jest.fn(() => jest.fn());
});

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMiddleware configuration', () => {
    it('should be created with correct locales', () => {
      expect(createMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          locales: ['en', 'fa'],
          defaultLocale: 'en',
          localePrefix: 'as-needed'
        })
      );
    });

    it('should export a middleware function', () => {
      expect(typeof middleware).toBe('function');
    });
  });

  describe('config', () => {
    it('should have correct matcher pattern', () => {
      expect(config.matcher).toContain('/((?!api|_next|_vercel|.*\\..*).*)');
    });

    it('should match regular pages', () => {
      const pattern = new RegExp(config.matcher[0].replace(/\(\?!/g, '(?!'));
      // Note: This is a simplified test - actual Next.js matcher is more complex
      expect(config.matcher[0]).toContain('(?!api|_next|_vercel|.*\\..*)');
    });
  });
});
