import React from 'react';
import { render, screen } from '@testing-library/react';
import LocaleLayout from '../layout';

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(() => Promise.resolve({ common: { test: 'Test' } }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  notFound: jest.fn()
}));

// Mock NextIntlClientProvider
jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en'
}));

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children with English locale', async () => {
    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'en' })
    });

    const { getByText } = render(layout);
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should render with RTL direction for Farsi locale', async () => {
    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'fa' })
    });

    const { container } = render(layout);
    const html = container.querySelector('html');
    expect(html).toHaveAttribute('dir', 'rtl');
    expect(html).toHaveAttribute('lang', 'fa');
  });

  it('should render with LTR direction for English locale', async () => {
    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'en' })
    });

    const { container } = render(layout);
    const html = container.querySelector('html');
    expect(html).toHaveAttribute('dir', 'ltr');
    expect(html).toHaveAttribute('lang', 'en');
  });

  it('should call notFound for invalid locale', async () => {
    const { notFound } = require('next/navigation');

    await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'invalid' })
    });

    expect(notFound).toHaveBeenCalled();
  });
});
