import { test, expect } from '@playwright/test';

test.describe('Tenant Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/dashboard/);

    // Navigate to tenants page
    await page.goto('/admin/tenants');
  });

  test('should display tenants list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/tenants/i);
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open add tenant modal', async ({ page }) => {
    await page.getByRole('button', { name: /add.*tenant/i }).click();

    await expect(page.locator('text=/add.*tenant/i')).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/domain/i)).toBeVisible();
  });

  test('should create new tenant', async ({ page }) => {
    await page.getByRole('button', { name: /add.*tenant/i }).click();

    await page.getByLabel(/name/i).fill('Acme Corporation');
    await page.getByLabel(/domain/i).fill('acme.com');
    await page.getByLabel(/description/i).fill('Test tenant');

    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.locator('text=/success|created/i')).toBeVisible();
  });

  test('should search tenants', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Acme');

    // Wait for search results
    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText(/acme/i);
  });

  test('should edit tenant', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="edit"]').click();

    // Should open edit modal
    await expect(page.locator('text=/edit.*tenant/i')).toBeVisible();

    // Update name
    const nameInput = page.getByLabel(/name/i);
    await nameInput.clear();
    await nameInput.fill('Updated Tenant Name');

    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.locator('text=/updated/i')).toBeVisible();
  });

  test('should delete tenant', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="delete"]').click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Should show success message
    await expect(page.locator('text=/deleted/i')).toBeVisible();
  });

  test('should view tenant details', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="view"]').click();

    // Should show tenant details
    await expect(page.locator('h2')).toContainText(/tenant.*details/i);
  });

  test('should display tenant users', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="view"]').click();

    // Navigate to users tab
    await page.getByRole('tab', { name: /users/i }).click();

    // Should show users list
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display tenant settings', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="view"]').click();

    // Navigate to settings tab
    await page.getByRole('tab', { name: /settings/i }).click();

    // Should show settings form
    await expect(page.locator('form')).toBeVisible();
  });

  test('should activate/deactivate tenant', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const statusToggle = firstRow.locator('[role="switch"]');

    await statusToggle.click();

    // Should show confirmation dialog
    await expect(page.locator('text=/are you sure/i')).toBeVisible();

    await page.getByRole('button', { name: /confirm/i }).click();

    // Should show success message
    await expect(page.locator('text=/status.*updated/i')).toBeVisible();
  });

  test('should export tenants', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: /export/i }).click();
    await page.getByText(/excel|csv|pdf/i).first().click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/tenants|export/);
  });

  test('should filter tenants by status', async ({ page }) => {
    await page.getByRole('button', { name: /filter/i }).click();
    await page.getByLabel(/status/i).selectOption('active');
    await page.getByRole('button', { name: /apply/i }).click();

    // All visible tenants should be active
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/active/i);
    }
  });

  test('should paginate tenants', async ({ page }) => {
    // Check if pagination exists (only if there are enough items)
    const paginationExists = await page.locator('[aria-label="pagination"]').isVisible();

    if (paginationExists) {
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // URL should update with page parameter
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /add.*tenant/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/name.*required/i')).toBeVisible();
    await expect(page.locator('text=/domain.*required/i')).toBeVisible();
  });
});
