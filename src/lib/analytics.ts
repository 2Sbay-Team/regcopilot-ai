/**
 * Analytics utility for tracking user interactions
 * Can be connected to analytics services like Google Analytics, Mixpanel, etc.
 */

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
}

interface ButtonClickEvent {
  button: 'get_started' | 'sign_in' | 'start_trial'
  source: string
}

interface SignupEvent {
  method: 'email'
  trial: boolean
}

interface LoginEvent {
  method: 'email'
  success: boolean
}

// Mock implementation - replace with actual analytics service
const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', event, properties)
  }

  // TODO: Integrate with actual analytics service
  // Example: gtag('event', event, properties)
  // Example: mixpanel.track(event, properties)
  
  // Store in localStorage for testing purposes
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
  events.push({
    event,
    properties,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem('analytics_events', JSON.stringify(events))
}

export const analytics = {
  /**
   * Track button click events
   */
  trackButtonClick: (data: ButtonClickEvent) => {
    trackEvent('button_click', {
      label: data.button,
      source: data.source,
      timestamp: Date.now()
    })
  },

  /**
   * Track user signup
   */
  trackSignup: (data: SignupEvent) => {
    trackEvent('user_signup', {
      method: data.method,
      trial: data.trial,
      timestamp: Date.now()
    })
  },

  /**
   * Track user login
   */
  trackLogin: (data: LoginEvent) => {
    trackEvent('user_login', {
      method: data.method,
      success: data.success,
      timestamp: Date.now()
    })
  },

  /**
   * Track page views
   */
  trackPageView: (page: string) => {
    trackEvent('page_view', {
      page,
      timestamp: Date.now()
    })
  },

  /**
   * Track generic custom events
   */
  track: (event: string, properties?: Record<string, any>) => {
    trackEvent(event, properties)
  },

  /**
   * Get all tracked events (for testing)
   */
  getEvents: () => {
    return JSON.parse(localStorage.getItem('analytics_events') || '[]')
  },

  /**
   * Clear all tracked events (for testing)
   */
  clearEvents: () => {
    localStorage.removeItem('analytics_events')
  }
}
