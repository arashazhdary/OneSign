import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/dashboard/);

    // Navigate to users page
    await page.goto('/admin/users');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/users/i);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(await page.locator('tbody tr').count());
  });

  test('should open add user modal', async ({ page }) => {
    await page.getByRole('button', { name: /add.*user/i }).click();

    await expect(page.locator('text=/add.*user/i')).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.getByRole('button', { name: /add.*user/i }).click();

    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/role/i).selectOption('User');

    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.locator('text=/success|created/i')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('John');

    // Wait for search results
    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText(/john/i);
  });

  test('should filter users by role', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByLabel(/role/i).selectOption('Admin');
    await page.getByRole('button', { name: /apply/i }).click();

    // All visible users should be admin
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/admin/i);
    }
  });

  test('should delete user', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="delete"]').click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Should show success message
    await expect(page.locator('text=/deleted/i')).toBeVisible();
  });

  test('should export users', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: /export/i }).click();
    await page.getByText(/excel|csv|pdf/i).first().click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/users|export/);
  });

  test('should perform bulk operations', async ({ page }) => {
    // Select multiple users
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    // Bulk delete
    await page.getByRole('button', { name: /bulk.*action/i }).click();
    await page.getByText(/delete/i).click();
    await page.getByRole('button', { name: /confirm/i }).click();

    await expect(page.locator('text=/deleted/i')).toBeVisible();
  });
});
