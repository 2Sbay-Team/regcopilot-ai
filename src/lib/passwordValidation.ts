// ============================================================================
// Password Security Validation Library
// ============================================================================

import { z } from 'zod';

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  expiry_days: number;
  password_history_count: number;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
}

/**
 * Default strong password policy
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  min_length: 12,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_special_chars: true,
  expiry_days: 90,
  password_history_count: 5
};

/**
 * Create Zod schema for password validation based on policy
 */
export function createPasswordSchema(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
  let schema = z.string();

  // Minimum length
  schema = schema.min(policy.min_length, {
    message: `Password must be at least ${policy.min_length} characters long`
  });

  // Maximum reasonable length
  schema = schema.max(128, {
    message: 'Password must be less than 128 characters'
  });

  // Apply regex patterns based on policy
  if (policy.require_uppercase) {
    schema = schema.regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter'
    });
  }

  if (policy.require_lowercase) {
    schema = schema.regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter'
    });
  }

  if (policy.require_numbers) {
    schema = schema.regex(/[0-9]/, {
      message: 'Password must contain at least one number'
    });
  }

  if (policy.require_special_chars) {
    schema = schema.regex(/[^A-Za-z0-9]/, {
      message: 'Password must contain at least one special character (!@#$%^&*)'
    });
  }

  return schema;
}

/**
 * Validate password against policy and return detailed feedback
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Length check
  if (password.length < policy.min_length) {
    errors.push(`Must be at least ${policy.min_length} characters long`);
  }

  // Uppercase check
  if (policy.require_uppercase && !/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
  }

  // Lowercase check
  if (policy.require_lowercase && !/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
  }

  // Number check
  if (policy.require_numbers && !/[0-9]/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
  }

  // Special character check
  if (policy.require_special_chars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*)');
  }

  // Check for common weak patterns
  const weakPatterns = [
    { pattern: /^[0-9]+$/, message: 'Cannot be only numbers' },
    { pattern: /^[A-Za-z]+$/, message: 'Cannot be only letters' },
    { pattern: /(.)\1{2,}/, message: 'Cannot have repeated characters (aaa, 111)' },
    { pattern: /^(password|admin|user|test|1234)/i, message: 'Cannot contain common words' },
    { pattern: /(123|abc|qwerty|password)/i, message: 'Cannot contain common sequences' }
  ];

  for (const { pattern, message } of weakPatterns) {
    if (pattern.test(password)) {
      errors.push(message);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate password strength score (0-4)
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 0.5;

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  score += varietyCount * 0.5;

  // Additional entropy checks
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 0.5; // High character diversity

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  if (/(123|abc|qwerty|password)/i.test(password)) {
    score -= 1;
    feedback.push('Avoid common sequences');
  }

  // Cap score at 4
  score = Math.max(0, Math.min(4, score));

  // Generate feedback
  if (password.length < 12) feedback.push('Use at least 12 characters');
  if (!hasUpper) feedback.push('Add uppercase letters');
  if (!hasLower) feedback.push('Add lowercase letters');
  if (!hasNumber) feedback.push('Add numbers');
  if (!hasSpecial) feedback.push('Add special characters');

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  if (score < 1.5) {
    label = 'Very Weak';
    color = '#ef4444'; // red
  } else if (score < 2.5) {
    label = 'Weak';
    color = '#f97316'; // orange
  } else if (score < 3) {
    label = 'Fair';
    color = '#eab308'; // yellow
  } else if (score < 3.5) {
    label = 'Strong';
    color = '#22c55e'; // green
  } else {
    label = 'Very Strong';
    color = '#16a34a'; // dark green
  }

  return {
    score,
    feedback,
    isValid: score >= 3,
    label,
    color
  };
}

/**
 * Check if password has expired
 */
export function isPasswordExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Calculate days until password expires
 */
export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format password expiry message
 */
export function getExpiryMessage(expiresAt: string | null): string | null {
  const days = daysUntilExpiry(expiresAt);
  
  if (days === null) return null;
  
  if (days < 0) {
    return 'Password has expired. Please change your password.';
  } else if (days === 0) {
    return 'Password expires today. Please change your password.';
  } else if (days <= 7) {
    return `Password expires in ${days} ${days === 1 ? 'day' : 'days'}. Consider changing it soon.`;
  } else if (days <= 30) {
    return `Password expires in ${days} days.`;
  }
  
  return null;
}
