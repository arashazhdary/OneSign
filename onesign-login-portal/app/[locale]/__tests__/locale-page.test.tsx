import { redirect } from 'next/navigation';
import HomePage from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('HomePage (Locale)', () => {
  const mockRedirect = redirect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login page with locale', async () => {
    const params = Promise.resolve({ locale: 'en' });

    await HomePage({ params });

    expect(mockRedirect).toHaveBeenCalledWith('/en/login');
  });

  it('should redirect with correct locale for different locales', async () => {
    const params = Promise.resolve({ locale: 'fa' });

    await HomePage({ params });

    expect(mockRedirect).toHaveBeenCalledWith('/fa/login');
  });

  it('should handle any locale string', async () => {
    const params = Promise.resolve({ locale: 'de' });

    await HomePage({ params });

    expect(mockRedirect).toHaveBeenCalledWith('/de/login');
  });
});
