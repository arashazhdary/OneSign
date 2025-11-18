import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, Locale } from '../../i18n';

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getRequestConfig: jest.fn((callback) => callback)
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}));

// Mock the message imports
jest.mock('../../messages/en.json', () => ({ common: { test: 'Test' } }), { virtual: true });
jest.mock('../../messages/fa.json', () => ({ common: { test: 'Test FA' } }), { virtual: true });

describe('i18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('locales', () => {
    it('should include English locale', () => {
      expect(locales).toContain('en');
    });

    it('should include Farsi locale', () => {
      expect(locales).toContain('fa');
    });

    it('should have exactly 2 locales', () => {
      expect(locales).toHaveLength(2);
    });
  });

  describe('getRequestConfig', () => {
    it('should be called with a callback', () => {
      expect(getRequestConfig).toHaveBeenCalled();
    });

    it('should return locale configuration for valid English locale', async () => {
      const configCallback = (getRequestConfig as jest.Mock).mock.calls[0][0];

      // Mock dynamic import
      jest.doMock('../../messages/en.json', () => ({
        default: { common: { test: 'Test' } }
      }), { virtual: true });

      const result = await configCallback({ locale: 'en' });

      expect(result.locale).toBe('en');
    });

    it('should return locale configuration for valid Farsi locale', async () => {
      const configCallback = (getRequestConfig as jest.Mock).mock.calls[0][0];

      // Mock dynamic import
      jest.doMock('../../messages/fa.json', () => ({
        default: { common: { test: 'Test FA' } }
      }), { virtual: true });

      const result = await configCallback({ locale: 'fa' });

      expect(result.locale).toBe('fa');
    });

    it('should call notFound for invalid locale', async () => {
      const configCallback = (getRequestConfig as jest.Mock).mock.calls[0][0];

      await configCallback({ locale: 'invalid' });

      expect(notFound).toHaveBeenCalled();
    });

    it('should call notFound for undefined locale', async () => {
      const configCallback = (getRequestConfig as jest.Mock).mock.calls[0][0];

      await configCallback({ locale: undefined });

      expect(notFound).toHaveBeenCalled();
    });

    it('should call notFound for null locale', async () => {
      const configCallback = (getRequestConfig as jest.Mock).mock.calls[0][0];

      await configCallback({ locale: null });

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('Locale type', () => {
    it('should accept valid English locale', () => {
      const locale: Locale = 'en';
      expect(locale).toBe('en');
    });

    it('should accept valid Farsi locale', () => {
      const locale: Locale = 'fa';
      expect(locale).toBe('fa');
    });
  });
});
