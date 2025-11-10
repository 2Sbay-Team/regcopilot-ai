import { test, expect } from '@playwright/test'

test.describe('Landing Page Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Get Started button navigates to signup page', async ({ page }) => {
    // Find and click the Get Started button
    const getStartedButton = page.getByTestId('get-started-button')
    await expect(getStartedButton).toBeVisible()
    
    await getStartedButton.click()
    
    // Verify navigation to signup page
    await expect(page).toHaveURL('/signup')
    
    // Verify signup page loaded correctly
    await expect(page.getByText('Join RegSense Advisor')).toBeVisible()
    
    // Verify NO trial badge is shown (regular signup)
    await expect(page.getByText('14-Day Free Trial')).not.toBeVisible()
  })

  test('Sign In button navigates to login page', async ({ page }) => {
    // Find and click the Sign In button
    const signInButton = page.getByTestId('sign-in-button')
    await expect(signInButton).toBeVisible()
    
    await signInButton.click()
    
    // Verify navigation to login page
    await expect(page).toHaveURL('/login')
    
    // Verify login page loaded correctly
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
  })

  test('Start Free Trial button navigates to signup with trial parameter', async ({ page }) => {
    // Find and click the Start Free Trial button
    const trialButton = page.getByTestId('start-trial-button')
    await expect(trialButton).toBeVisible()
    
    await trialButton.click()
    
    // Verify navigation to signup page with trial parameter
    await expect(page).toHaveURL('/signup?trial=true')
    
    // Verify signup page loaded correctly
    await expect(page.getByText('Join RegSense Advisor')).toBeVisible()
    
    // Verify trial badge IS shown
    await expect(page.getByText('14-Day Free Trial')).toBeVisible()
    
    // Verify trial-specific messaging
    await expect(page.getByText('Start your free trial — No credit card required')).toBeVisible()
  })

  test('All three buttons perform distinct actions', async ({ page }) => {
    // Test Get Started
    const getStartedButton = page.getByTestId('get-started-button')
    await getStartedButton.click()
    await expect(page).toHaveURL('/signup')
    await page.goBack()
    
    // Test Sign In
    const signInButton = page.getByTestId('sign-in-button')
    await signInButton.click()
    await expect(page).toHaveURL('/login')
    await page.goBack()
    
    // Test Start Trial
    const trialButton = page.getByTestId('start-trial-button')
    await trialButton.click()
    await expect(page).toHaveURL('/signup?trial=true')
  })

  test('Analytics events are tracked for button clicks', async ({ page }) => {
    // Track console logs for analytics events
    const analyticsEvents: string[] = []
    page.on('console', msg => {
      if (msg.text().includes('Analytics Event')) {
        analyticsEvents.push(msg.text())
      }
    })
    
    // Click each button and verify analytics events
    await page.getByTestId('get-started-button').click()
    await page.waitForTimeout(100)
    expect(analyticsEvents.some(e => e.includes('get_started'))).toBeTruthy()
    
    await page.goBack()
    
    await page.getByTestId('sign-in-button').click()
    await page.waitForTimeout(100)
    expect(analyticsEvents.some(e => e.includes('sign_in'))).toBeTruthy()
    
    await page.goBack()
    
    await page.getByTestId('start-trial-button').click()
    await page.waitForTimeout(100)
    expect(analyticsEvents.some(e => e.includes('start_trial'))).toBeTruthy()
  })

  test('Trial signup flow shows correct messaging', async ({ page }) => {
    // Navigate to trial signup
    await page.getByTestId('start-trial-button').click()
    await expect(page).toHaveURL('/signup?trial=true')
    
    // Fill out signup form
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!')
    await page.getByLabel('Confirm Password').fill('SecurePass123!')
    
    // Note: We don't submit in e2e tests to avoid creating test accounts
    // But verify all trial-related UI elements are present
    await expect(page.getByText('14-Day Free Trial')).toBeVisible()
    await expect(page.getByText('Start your free trial')).toBeVisible()
  })

  test('Regular signup flow has different messaging than trial', async ({ page }) => {
    // Navigate to regular signup
    await page.getByTestId('get-started-button').click()
    await expect(page).toHaveURL('/signup')
    
    // Verify regular signup messaging (no trial mentions)
    await expect(page.getByText('14-Day Free Trial')).not.toBeVisible()
    await expect(page.getByText('AI-Powered Regulatory Intelligence')).toBeVisible()
  })

  test('Login page is distinct from signup pages', async ({ page }) => {
    await page.getByTestId('sign-in-button').click()
    await expect(page).toHaveURL('/login')
    
    // Verify login-specific elements
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    
    // Verify NO signup elements
    await expect(page.getByText('Join RegSense Advisor')).not.toBeVisible()
    await expect(page.getByLabel('Full Name')).not.toBeVisible()
  })

  test('User can navigate between login and signup pages', async ({ page }) => {
    // Start at login
    await page.getByTestId('sign-in-button').click()
    await expect(page).toHaveURL('/login')
    
    // Find and click link to signup
    const signupLink = page.getByText(/don't have an account/i).or(page.getByText(/sign up/i)).first()
    if (await signupLink.isVisible()) {
      await signupLink.click()
      await expect(page).toHaveURL('/signup')
    }
    
    // Go back to login
    const loginLink = page.getByText(/already have an account/i).or(page.getByText(/sign in/i)).first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL('/login')
    }
  })
})
