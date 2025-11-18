import HomePage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to tenant dashboard for English locale', async () => {
    const { redirect } = require('next/navigation');

    await HomePage({
      params: Promise.resolve({ locale: 'en' })
    });

    expect(redirect).toHaveBeenCalledWith('/en/tenant/dashboard');
  });

  it('should redirect to tenant dashboard for Farsi locale', async () => {
    const { redirect } = require('next/navigation');

    await HomePage({
      params: Promise.resolve({ locale: 'fa' })
    });

    expect(redirect).toHaveBeenCalledWith('/fa/tenant/dashboard');
  });
});
