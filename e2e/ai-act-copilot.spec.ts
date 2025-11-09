import { test, expect } from '@playwright/test';

test.describe('AI Act Copilot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-act');
  });

  test('should display AI Act assessment form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/AI Act/i);
    await expect(page.locator('input[name="system_name"]')).toBeVisible();
    await expect(page.locator('textarea[name="purpose"]')).toBeVisible();
    await expect(page.locator('select[name="sector"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/required/i')).toBeVisible();
  });

  test('should submit assessment form', async ({ page }) => {
    await page.fill('input[name="system_name"]', 'Test AI System');
    await page.fill('textarea[name="purpose"]', 'Automated decision-making');
    await page.selectOption('select[name="sector"]', 'financial_services');
    await page.selectOption('select[name="deployment_status"]', 'production');
    
    await page.click('button[type="submit"]');
    
    // Wait for results
    await expect(page.locator('text=/risk category/i')).toBeVisible({ timeout: 30000 });
  });

  test('should display risk classification', async ({ page }) => {
    // Submit form first
    await page.fill('input[name="system_name"]', 'Test System');
    await page.fill('textarea[name="purpose"]', 'Test purpose');
    await page.selectOption('select[name="sector"]', 'healthcare');
    await page.click('button[type="submit"]');
    
    // Check for risk category (high for healthcare)
    await expect(page.locator('text=/high risk/i')).toBeVisible({ timeout: 30000 });
  });

  test('should display Annex IV summary', async ({ page }) => {
    await page.fill('input[name="system_name"]', 'Test System');
    await page.fill('textarea[name="purpose"]', 'Test purpose');
    await page.selectOption('select[name="sector"]', 'education');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/Annex IV/i')).toBeVisible({ timeout: 30000 });
  });

  test('should show explainability view', async ({ page }) => {
    // After assessment completes
    await page.fill('input[name="system_name"]', 'Test System');
    await page.fill('textarea[name="purpose"]', 'Test purpose');
    await page.selectOption('select[name="sector"]', 'marketing');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=/reasoning/i', { timeout: 30000 });
    await page.click('text=/view reasoning/i');
    
    await expect(page.locator('text=/AI reasoning/i')).toBeVisible();
  });
});
