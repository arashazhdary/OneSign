import { test, expect } from '@playwright/test';

test.describe('Role Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/dashboard/);

    // Navigate to roles page
    await page.goto('/admin/roles');
  });

  test('should display roles list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/roles/i);
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open add role modal', async ({ page }) => {
    await page.getByRole('button', { name: /add.*role/i }).click();

    await expect(page.locator('text=/add.*role/i')).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
  });

  test('should create new role', async ({ page }) => {
    await page.getByRole('button', { name: /add.*role/i }).click();

    await page.getByLabel(/name/i).fill('Content Editor');
    await page.getByLabel(/description/i).fill('Can edit content');

    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.locator('text=/success|created/i')).toBeVisible();
  });

  test('should search roles', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Admin');

    // Wait for search results
    await page.waitForTimeout(500);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText(/admin/i);
  });

  test('should edit role', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="edit"]').click();

    // Should open edit modal
    await expect(page.locator('text=/edit.*role/i')).toBeVisible();

    // Update description
    const descInput = page.getByLabel(/description/i);
    await descInput.clear();
    await descInput.fill('Updated description');

    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.locator('text=/updated/i')).toBeVisible();
  });

  test('should delete role', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="delete"]').click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Should show success message
    await expect(page.locator('text=/deleted/i')).toBeVisible();
  });

  test('should manage role permissions', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="edit"]').click();

    // Navigate to permissions tab
    await page.getByRole('tab', { name: /permissions/i }).click();

    // Should show permissions checkboxes
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
  });

  test('should select permissions', async ({ page }) => {
    await page.getByRole('button', { name: /add.*role/i }).click();

    await page.getByLabel(/name/i).fill('Moderator');
    await page.getByLabel(/description/i).fill('Can moderate content');

    // Navigate to permissions tab
    await page.getByRole('tab', { name: /permissions/i }).click();

    // Select some permissions
    await page.getByLabel(/users.*read/i).check();
    await page.getByLabel(/users.*write/i).check();

    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.locator('text=/success|created/i')).toBeVisible();
  });

  test('should select all permissions', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="edit"]').click();

    await page.getByRole('tab', { name: /permissions/i }).click();

    // Click "Select All" checkbox
    await page.getByLabel(/select.*all/i).click();

    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    // All checkboxes should be checked
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should filter permissions by category', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="edit"]').click();

    await page.getByRole('tab', { name: /permissions/i }).click();

    // Filter by category
    await page.getByLabel(/category/i).selectOption('Users');

    // Should only show user-related permissions
    const permissions = page.locator('.permission-item');
    const count = await permissions.count();

    for (let i = 0; i < count; i++) {
      await expect(permissions.nth(i)).toContainText(/users/i);
    }
  });

  test('should view role details', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="view"]').click();

    // Should show role details
    await expect(page.locator('h2')).toContainText(/role.*details/i);
  });

  test('should display users with role', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="view"]').click();

    // Navigate to users tab
    await page.getByRole('tab', { name: /users/i }).click();

    // Should show users with this role
    await expect(page.locator('table')).toBeVisible();
  });

  test('should clone role', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('[aria-label*="clone"]').click();

    // Should open create modal with pre-filled data
    await expect(page.locator('text=/clone.*role/i')).toBeVisible();

    const nameInput = page.getByLabel(/name/i);
    const value = await nameInput.inputValue();

    expect(value).toContain('Copy');
  });

  test('should export roles', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: /export/i }).click();
    await page.getByText(/excel|csv|pdf/i).first().click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/roles|export/);
  });

  test('should prevent deleting system roles', async ({ page }) => {
    // Find a system role (usually marked as such)
    const systemRole = page.locator('tbody tr').filter({ hasText: /system/i }).first();

    if (await systemRole.isVisible()) {
      const deleteButton = systemRole.locator('[aria-label*="delete"]');

      // Delete button should be disabled for system roles
      await expect(deleteButton).toBeDisabled();
    }
  });

  test('should validate unique role name', async ({ page }) => {
    await page.getByRole('button', { name: /add.*role/i }).click();

    // Try to create a role with an existing name
    await page.getByLabel(/name/i).fill('Admin');
    await page.getByLabel(/description/i).fill('Test');

    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show validation error
    await expect(page.locator('text=/name.*already.*exists/i')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /add.*role/i }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/name.*required/i')).toBeVisible();
  });

  test('should paginate roles', async ({ page }) => {
    const paginationExists = await page.locator('[aria-label="pagination"]').isVisible();

    if (paginationExists) {
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // URL should update with page parameter
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
