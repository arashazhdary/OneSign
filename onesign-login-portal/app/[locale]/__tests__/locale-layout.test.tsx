import React from 'react';
import { render } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('next-intl/server', () => ({
  getMessages: jest.fn(),
}));

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children, messages }: { children: React.ReactNode; messages: any }) => (
    <div data-testid="intl-provider" data-messages={JSON.stringify(messages)}>
      {children}
    </div>
  ),
}));

// Mock i18n to prevent import issues
jest.mock('../../../i18n', () => ({
  locales: ['en', 'fa'],
}));

// Import after mocks are set up
import LocaleLayout from '../layout';

describe('LocaleLayout', () => {
  const mockNotFound = notFound as jest.Mock;
  const mockGetMessages = getMessages as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMessages.mockResolvedValue({
      common: { test: 'Test message' },
    });
  });

  it('should render children with NextIntlClientProvider', async () => {
    const params = Promise.resolve({ locale: 'en' });

    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    const { container } = render(layout);

    expect(container.textContent).toContain('Test Content');
  });

  it('should set html lang attribute', async () => {
    const params = Promise.resolve({ locale: 'en' });

    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    // Check that the layout returns an html element with lang attribute
    expect(layout.type).toBe('html');
    expect(layout.props.lang).toBe('en');
  });

  it('should set dir to rtl for fa locale', async () => {
    const params = Promise.resolve({ locale: 'fa' });

    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    expect(layout.type).toBe('html');
    expect(layout.props.dir).toBe('rtl');
  });

  it('should set dir to ltr for en locale', async () => {
    const params = Promise.resolve({ locale: 'en' });

    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    expect(layout.type).toBe('html');
    expect(layout.props.dir).toBe('ltr');
  });

  it('should call notFound for invalid locale', async () => {
    const params = Promise.resolve({ locale: 'invalid' });

    await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should call getMessages', async () => {
    const params = Promise.resolve({ locale: 'en' });

    await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    expect(mockGetMessages).toHaveBeenCalled();
  });

  it('should pass messages to NextIntlClientProvider', async () => {
    const params = Promise.resolve({ locale: 'en' });
    const testMessages = { test: 'message' };
    mockGetMessages.mockResolvedValue(testMessages);

    const layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params,
    });

    const { container } = render(layout);
    const provider = container.querySelector('[data-testid="intl-provider"]');

    expect(provider).toHaveAttribute('data-messages', JSON.stringify(testMessages));
  });
});
