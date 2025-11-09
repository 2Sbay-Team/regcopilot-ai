/**
 * Accessibility Utilities for WCAG 2.2 Compliance
 * Provides helper functions for keyboard navigation, screen readers, and focus management
 */

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  firstFocusable?.focus()

  return () => element.removeEventListener('keydown', handleKeyDown)
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  announcer.textContent = message
  
  document.body.appendChild(announcer)
  
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

/**
 * Check if element has sufficient color contrast
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  meetsAA: boolean
  meetsAAA: boolean
} {
  const getLuminance = (color: string): number => {
    // Simple luminance calculation for hex colors
    const rgb = parseInt(color.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  
  return {
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7
  }
}

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

/**
 * Keyboard navigation handler for lists
 */
export function handleListKeyboard(
  e: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect: (index: number) => void
) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      const nextIndex = Math.min(currentIndex + 1, items.length - 1)
      items[nextIndex]?.focus()
      onSelect(nextIndex)
      break
    case 'ArrowUp':
      e.preventDefault()
      const prevIndex = Math.max(currentIndex - 1, 0)
      items[prevIndex]?.focus()
      onSelect(prevIndex)
      break
    case 'Home':
      e.preventDefault()
      items[0]?.focus()
      onSelect(0)
      break
    case 'End':
      e.preventDefault()
      items[items.length - 1]?.focus()
      onSelect(items.length - 1)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      onSelect(currentIndex)
      break
  }
}

/**
 * Skip navigation link component helper
 */
export const skipNavStyles = `
  .skip-nav {
    position: absolute;
    top: -40px;
    left: 0;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
    z-index: 100;
  }
  
  .skip-nav:focus {
    top: 0;
  }
`

/**
 * Accessible button press handler (Enter + Space)
 */
export function handleAccessibleClick(
  e: React.KeyboardEvent,
  onClick: () => void
) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

/**
 * Focus management for route changes
 */
export function focusMainContent() {
  const main = document.querySelector('main')
  if (main) {
    main.setAttribute('tabindex', '-1')
    main.focus()
    setTimeout(() => main.removeAttribute('tabindex'), 100)
  }
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = []
  
  const ariaLabel = element.getAttribute('aria-label')
  const ariaLabelledby = element.getAttribute('aria-labelledby')
  const role = element.getAttribute('role')
  
  // Check for required labels
  if (role && ['button', 'link', 'checkbox'].includes(role)) {
    if (!ariaLabel && !ariaLabelledby && !element.textContent?.trim()) {
      errors.push(`Element with role="${role}" must have accessible label`)
    }
  }
  
  // Check for valid ARIA relationships
  if (ariaLabelledby) {
    const labelElement = document.getElementById(ariaLabelledby)
    if (!labelElement) {
      errors.push(`aria-labelledby references non-existent element: ${ariaLabelledby}`)
    }
  }
  
  return errors
}

/**
 * Live region manager for dynamic content updates
 */
export class LiveRegionManager {
  private region: HTMLDivElement | null = null

  constructor(priority: 'polite' | 'assertive' = 'polite') {
    this.region = document.createElement('div')
    this.region.setAttribute('role', 'status')
    this.region.setAttribute('aria-live', priority)
    this.region.setAttribute('aria-atomic', 'true')
    this.region.className = 'sr-only'
    document.body.appendChild(this.region)
  }

  announce(message: string) {
    if (this.region) {
      this.region.textContent = message
    }
  }

  destroy() {
    if (this.region) {
      document.body.removeChild(this.region)
      this.region = null
    }
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * ARIA-compliant loading spinner wrapper
 */
export function createAccessibleLoadingState(label: string = 'Loading') {
  return {
    role: 'status',
    'aria-live': 'polite',
    'aria-label': label,
    'aria-busy': true
  }
}
