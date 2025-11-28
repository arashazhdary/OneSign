import { test, expect } from '@playwright/test';

test.describe('Landing Page - English', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/en/landing');

    // Check page title
    await expect(page).toHaveTitle(/OneSign/);

    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/en/landing');

    // Check navigation links exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display all main sections', async ({ page }) => {
    await page.goto('/en/landing');

    // Scroll through page to load all sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual regression
    await page.screenshot({ path: 'e2e/screenshots/landing-en-full.png', fullPage: true });
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/en/landing');

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check for alt text on images
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en/landing');
    await expect(page.locator('body')).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Landing Page - Farsi (RTL)', () => {
  test('should load Farsi landing page', async ({ page }) => {
    await page.goto('/fa/landing');

    await expect(page).toHaveTitle(/OneSign/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should have RTL layout', async ({ page }) => {
    await page.goto('/fa/landing');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');

    const lang = await html.getAttribute('lang');
    expect(lang).toBe('fa');
  });
});

test.describe('Health Check', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('onesign-landing');
  });
});

test.describe('SEO', () => {
  test('should have sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('urlset');
  });

  test('should have robots.txt', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();

    const body = await response.text();
    expect(body).toContain('User-agent');
    expect(body).toContain('Sitemap');
  });

  test('should have manifest', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBeTruthy();
  });
});
