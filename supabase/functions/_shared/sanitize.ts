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
  
  // Limit length
  sanitized = sanitized.slice(0, maxLength);
  
  return sanitized.trim();
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
