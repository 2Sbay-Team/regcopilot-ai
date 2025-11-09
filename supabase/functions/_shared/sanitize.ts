/**
 * Sanitizes user input to prevent prompt injection attacks
 * Removes control characters and limits dangerous patterns
 */
export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input) return '';
  
  // Remove control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove Unicode direction override characters (used in prompt injection)
  sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
  
  // Remove potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|all)\s+instructions?/gi,
    /system\s*:\s*you\s+are\s+now/gi,
    /role\s*:\s*admin/gi,
    /<!--.*?-->/gs,
    /\{%.*?%\}/gs,
    /<script[^>]*>.*?<\/script>/gis
  ];
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Limit length
  sanitized = sanitized.slice(0, maxLength);
  
  return sanitized.trim();
}

/**
 * Detects potential prompt injection attempts
 * Returns threat level and indicators
 */
export function detectPromptInjection(input: string): {
  isThreat: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  indicators: string[];
} {
  const indicators: string[] = [];
  let threatLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  
  // Check for command injection patterns
  if (/ignore\s+(previous|all)\s+instructions?/gi.test(input)) {
    indicators.push('ignore_instructions');
    threatLevel = 'high';
  }
  
  if (/system\s*:\s*you\s+are\s+now/gi.test(input)) {
    indicators.push('role_override_attempt');
    threatLevel = 'high';
  }
  
  if (/role\s*:\s*(admin|system|root)/gi.test(input)) {
    indicators.push('privilege_escalation');
    threatLevel = 'high';
  }
  
  // Check for data exfiltration attempts
  if (/return\s+all\s+(data|users|records|passwords)/gi.test(input)) {
    indicators.push('data_exfiltration_attempt');
    threatLevel = 'high';
  }
  
  // Check for Unicode/control character abuse
  if (/[\u202A-\u202E\u2066-\u2069]/.test(input)) {
    indicators.push('unicode_direction_override');
    threatLevel = 'medium';
  }
  
  // Check for excessive special characters
  const specialCharRatio = (input.match(/[^\w\s]/g) || []).length / input.length;
  if (specialCharRatio > 0.3) {
    indicators.push('excessive_special_chars');
    if (threatLevel === 'none') threatLevel = 'low';
  }
  
  return {
    isThreat: indicators.length > 0,
    threatLevel,
    indicators
  };
}

/**
 * Sanitizes an object by applying sanitization to all string values
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Creates a structured prompt with clear role separation
 * This prevents user input from being interpreted as system instructions
 */
export function createStructuredMessages(
  systemPrompt: string,
  userContext: Record<string, any>
): Array<{ role: string; content: string }> {
  return [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: JSON.stringify(userContext, null, 2)
    }
  ];
}
