import { describe, it, expect, beforeEach } from 'vitest'
import { analytics } from '@/lib/analytics'

describe('Analytics Utility', () => {
  beforeEach(() => {
    analytics.clearEvents()
  })

  it('should track button click events', () => {
    analytics.trackButtonClick({
      button: 'get_started',
      source: 'hero_section'
    })

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('button_click')
    expect(events[0].properties.label).toBe('get_started')
    expect(events[0].properties.source).toBe('hero_section')
  })

  it('should track signup events', () => {
    analytics.trackSignup({
      method: 'email',
      trial: true
    })

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('user_signup')
    expect(events[0].properties.method).toBe('email')
    expect(events[0].properties.trial).toBe(true)
  })

  it('should track login events', () => {
    analytics.trackLogin({
      method: 'email',
      success: true
    })

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('user_login')
    expect(events[0].properties.method).toBe('email')
    expect(events[0].properties.success).toBe(true)
  })

  it('should track page view events', () => {
    analytics.trackPageView('landing')

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('page_view')
    expect(events[0].properties.page).toBe('landing')
  })

  it('should track custom events', () => {
    analytics.track('custom_event', { foo: 'bar' })

    const events = analytics.getEvents()
    expect(events).toHaveLength(1)
    expect(events[0].event).toBe('custom_event')
    expect(events[0].properties.foo).toBe('bar')
  })

  it('should store multiple events', () => {
    analytics.trackButtonClick({ button: 'get_started', source: 'hero' })
    analytics.trackPageView('landing')
    analytics.trackLogin({ method: 'email', success: true })

    const events = analytics.getEvents()
    expect(events).toHaveLength(3)
  })

  it('should include timestamps', () => {
    analytics.trackButtonClick({ button: 'get_started', source: 'hero' })

    const events = analytics.getEvents()
    expect(events[0].timestamp).toBeDefined()
    expect(typeof events[0].timestamp).toBe('string')
  })

  it('should clear events', () => {
    analytics.trackButtonClick({ button: 'get_started', source: 'hero' })
    expect(analytics.getEvents()).toHaveLength(1)

    analytics.clearEvents()
    expect(analytics.getEvents()).toHaveLength(0)
  })

  it('should distinguish between trial and regular signups', () => {
    // Regular signup
    analytics.trackSignup({ method: 'email', trial: false })
    
    // Trial signup
    analytics.trackSignup({ method: 'email', trial: true })

    const events = analytics.getEvents()
    expect(events).toHaveLength(2)
    expect(events[0].properties.trial).toBe(false)
    expect(events[1].properties.trial).toBe(true)
  })

  it('should track successful and failed logins separately', () => {
    analytics.trackLogin({ method: 'email', success: true })
    analytics.trackLogin({ method: 'email', success: false })

    const events = analytics.getEvents()
    expect(events).toHaveLength(2)
    expect(events[0].properties.success).toBe(true)
    expect(events[1].properties.success).toBe(false)
  })
})
