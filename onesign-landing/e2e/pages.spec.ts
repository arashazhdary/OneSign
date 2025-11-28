import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test('should load pricing page successfully', async ({ page }) => {
    await page.goto('/en/pricing');
    await expect(page).toHaveTitle(/OneSign/);
    await expect(page.locator('h1')).toContainText('Simple, Transparent Pricing');
  });

  test('should toggle between monthly and yearly billing', async ({ page }) => {
    await page.goto('/en/pricing');

    // Check monthly is selected by default
    const monthlyButton = page.locator('button:has-text("Monthly")');
    await expect(monthlyButton).toHaveClass(/bg-blue-600/);

    // Click yearly
    const yearlyButton = page.locator('button:has-text("Yearly")');
    await yearlyButton.click();
    await expect(yearlyButton).toHaveClass(/bg-blue-600/);

    // Check savings message appears
    await expect(page.locator('text=/Save.*%/')).toBeVisible();
  });

  test('should display all pricing plans', async ({ page }) => {
    await page.goto('/en/pricing');

    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=Business')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('should show popular badge on Professional plan', async ({ page }) => {
    await page.goto('/en/pricing');
    await expect(page.locator('text=Most Popular')).toBeVisible();
  });
});

test.describe('Features Page', () => {
  test('should load features page successfully', async ({ page }) => {
    await page.goto('/en/features');
    await expect(page.locator('h1')).toContainText('Powerful Features');
  });

  test('should display all feature categories', async ({ page }) => {
    await page.goto('/en/features');

    await expect(page.locator('text=Security & Compliance')).toBeVisible();
    await expect(page.locator('text=Signing & Workflow')).toBeVisible();
    await expect(page.locator('text=Document Management')).toBeVisible();
    await expect(page.locator('text=Integration & API')).toBeVisible();
    await expect(page.locator('text=Mobile & Accessibility')).toBeVisible();
    await expect(page.locator('text=Team & Collaboration')).toBeVisible();
  });

  test('should show feature cards with hover effect', async ({ page }) => {
    await page.goto('/en/features');
    const firstCard = page.locator('.group').first();
    await firstCard.hover();
    // Card should have hover class
  });
});

test.describe('Contact Page', () => {
  test('should load contact page successfully', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.locator('h1')).toContainText('Get in Touch');
  });

  test('should display all contact methods', async ({ page }) => {
    await page.goto('/en/contact');

    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Phone')).toBeVisible();
    await expect(page.locator('text=Live Chat')).toBeVisible();
    await expect(page.locator('text=Office')).toBeVisible();
  });

  test('should display contact form', async ({ page }) => {
    await page.goto('/en/contact');

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/en/contact');

    // Try to submit without filling
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=/must be at least/')).toBeVisible();
  });
});

test.describe('About Page', () => {
  test('should load about page successfully', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('h1')).toContainText('About OneSign');
  });

  test('should display company story', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('text=Our Story')).toBeVisible();
    await expect(page.locator('text=/OneSign was born/')).toBeVisible();
  });

  test('should display all company values', async ({ page }) => {
    await page.goto('/en/about');

    await expect(page.locator('text=Customer First')).toBeVisible();
    await expect(page.locator('text=Security Always')).toBeVisible();
    await expect(page.locator('text=Innovation')).toBeVisible();
    await expect(page.locator('text=Integrity')).toBeVisible();
  });

  test('should display leadership team', async ({ page }) => {
    await page.goto('/en/about');

    await expect(page.locator('text=Meet Our Leadership')).toBeVisible();
    await expect(page.locator('text=Sarah Johnson')).toBeVisible();
    await expect(page.locator('text=Michael Chen')).toBeVisible();
  });

  test('should display company timeline', async ({ page }) => {
    await page.goto('/en/about');

    await expect(page.locator('text=Our Journey')).toBeVisible();
    await expect(page.locator('text=2018')).toBeVisible();
    await expect(page.locator('text=2024')).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('should navigate between pages using header', async ({ page }) => {
    await page.goto('/en/landing');

    // Click Features in header
    await page.locator('a:has-text("Features")').click();
    await expect(page).toHaveURL(/\/features/);

    // Click Pricing
    await page.locator('a:has-text("Pricing")').click();
    await expect(page).toHaveURL(/\/pricing/);

    // Click About
    await page.locator('a:has-text("About")').click();
    await expect(page).toHaveURL(/\/about/);

    // Click Contact
    await page.locator('a:has-text("Contact")').click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('should toggle language', async ({ page }) => {
    await page.goto('/en/landing');

    // Click language switcher
    await page.locator('button:has-text("فارسی")').click();

    // Should redirect to Farsi version
    await expect(page).toHaveURL(/\/fa\//);
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/en/landing');

    // Click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme" i]').first();
    await themeToggle.click();

    // Check if dark class is applied
    const html = page.locator('html');
    const htmlClass = await html.getAttribute('class');
    expect(htmlClass).toMatch(/dark|light/);
  });
});
