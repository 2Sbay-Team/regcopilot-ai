import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');
    // In a real scenario, you'd login with test credentials
  });

  test('should display dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/dashboard/i);
  });

  test('should display key metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for metric cards
    await expect(page.locator('text=/compliance score/i')).toBeVisible();
    await expect(page.locator('text=/assessments/i')).toBeVisible();
    await expect(page.locator('text=/alerts/i')).toBeVisible();
  });

  test('should navigate to copilot modules', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('text=/AI Act/i');
    await expect(page).toHaveURL(/\/ai-act/);
    
    await page.goto('/dashboard');
    await page.click('text=/GDPR/i');
    await expect(page).toHaveURL(/\/gdpr/);
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=/recent activity/i')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Check that mobile menu is present
    await expect(page.locator('[aria-label="Menu"]')).toBeVisible();
  });
});
