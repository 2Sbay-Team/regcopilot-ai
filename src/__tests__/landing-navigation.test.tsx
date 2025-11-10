import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Index from '@/pages/Index'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { analytics } from '@/lib/analytics'

// Mock the navigation hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  analytics: {
    trackButtonClick: vi.fn(),
    trackPageView: vi.fn(),
  }
}))

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const renderLandingPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Landing Page Navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
    analytics.clearEvents()
  })

  describe('Get Started Button', () => {
    it('should render the Get Started button', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="get-started-button"]')
      expect(button).toBeDefined()
      expect(button?.textContent).toContain('Get Started')
    })

    it('should navigate to /signup when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="get-started-button"]') as HTMLElement
      
      button?.click()
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup')
    })

    it('should track analytics event when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="get-started-button"]') as HTMLElement
      
      button?.click()
      
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'get_started',
        source: 'hero_section'
      })
    })
  })

  describe('Sign In Button', () => {
    it('should render the Sign In button', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="sign-in-button"]')
      expect(button).toBeDefined()
      expect(button?.textContent).toContain('Sign In')
    })

    it('should navigate to /login when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="sign-in-button"]') as HTMLElement
      
      button?.click()
      
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('should track analytics event when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="sign-in-button"]') as HTMLElement
      
      button?.click()
      
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'sign_in',
        source: 'hero_section'
      })
    })
  })

  describe('Start Free Trial Button', () => {
    it('should render the Start Free Trial button', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="start-trial-button"]')
      expect(button).toBeDefined()
      expect(button?.textContent).toContain('Free Trial')
    })

    it('should navigate to /signup?trial=true when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="start-trial-button"]') as HTMLElement
      
      button?.click()
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup?trial=true')
    })

    it('should track analytics event when clicked', () => {
      const { container } = renderLandingPage()
      const button = container.querySelector('[data-testid="start-trial-button"]') as HTMLElement
      
      button?.click()
      
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'start_trial',
        source: 'cta_section'
      })
    })
  })

  describe('Button Distinction', () => {
    it('should have three distinct navigation paths', () => {
      const { container } = renderLandingPage()
      
      const getStartedBtn = container.querySelector('[data-testid="get-started-button"]') as HTMLElement
      const signInBtn = container.querySelector('[data-testid="sign-in-button"]') as HTMLElement
      const trialBtn = container.querySelector('[data-testid="start-trial-button"]') as HTMLElement
      
      getStartedBtn?.click()
      expect(mockNavigate).toHaveBeenCalledWith('/signup')
      
      mockNavigate.mockClear()
      signInBtn?.click()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
      
      mockNavigate.mockClear()
      trialBtn?.click()
      expect(mockNavigate).toHaveBeenCalledWith('/signup?trial=true')
    })

    it('should track different analytics events for each button', () => {
      const { container } = renderLandingPage()
      
      const getStartedBtn = container.querySelector('[data-testid="get-started-button"]') as HTMLElement
      const signInBtn = container.querySelector('[data-testid="sign-in-button"]') as HTMLElement
      const trialBtn = container.querySelector('[data-testid="start-trial-button"]') as HTMLElement
      
      getStartedBtn?.click()
      signInBtn?.click()
      trialBtn?.click()
      
      expect(analytics.trackButtonClick).toHaveBeenCalledTimes(3)
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'get_started',
        source: 'hero_section'
      })
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'sign_in',
        source: 'hero_section'
      })
      expect(analytics.trackButtonClick).toHaveBeenCalledWith({
        button: 'start_trial',
        source: 'cta_section'
      })
    })
  })

  describe('Page Load Analytics', () => {
    it('should track page view on mount', () => {
      renderLandingPage()
      
      expect(analytics.trackPageView).toHaveBeenCalledWith('landing')
    })
  })
})
