// ============================================================================
// PHASE 6: PII Detection and Masking (GDPR Art 25 - Privacy by Design)
// ============================================================================

/**
 * PII patterns for detection and masking
 */
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?(\d{1,3}))?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  taxId: /\b\d{2}-\d{7}\b/g
}

/**
 * Common personal identifiers
 */
const PERSONAL_IDENTIFIERS = [
  'name', 'firstname', 'lastname', 'surname',
  'address', 'street', 'city', 'zipcode', 'postal',
  'birthday', 'birthdate', 'dob',
  'username', 'userid', 'employee_id',
  'patient_id', 'customer_id'
]

export interface PIIDetectionResult {
  hasPII: boolean
  maskedText: string
  detectedTypes: string[]
  originalLength: number
  maskedLength: number
}

/**
 * Detect and mask PII in text before sending to embedding models
 * Implements GDPR Article 25 - Data Protection by Design
 */
export function maskPII(text: string, preserveStructure: boolean = true): PIIDetectionResult {
  let maskedText = text
  const detectedTypes: Set<string> = new Set()

  // Mask email addresses
  if (PII_PATTERNS.email.test(maskedText)) {
    detectedTypes.add('email')
    maskedText = maskedText.replace(PII_PATTERNS.email, preserveStructure ? '[EMAIL]' : '[REDACTED]')
  }

  // Mask phone numbers
  if (PII_PATTERNS.phone.test(maskedText)) {
    detectedTypes.add('phone')
    maskedText = maskedText.replace(PII_PATTERNS.phone, preserveStructure ? '[PHONE]' : '[REDACTED]')
  }

  // Mask SSN
  if (PII_PATTERNS.ssn.test(maskedText)) {
    detectedTypes.add('ssn')
    maskedText = maskedText.replace(PII_PATTERNS.ssn, preserveStructure ? '[SSN]' : '[REDACTED]')
  }

  // Mask credit cards
  if (PII_PATTERNS.creditCard.test(maskedText)) {
    detectedTypes.add('creditCard')
    maskedText = maskedText.replace(PII_PATTERNS.creditCard, preserveStructure ? '[CARD]' : '[REDACTED]')
  }

  // Mask IP addresses
  if (PII_PATTERNS.ipAddress.test(maskedText)) {
    detectedTypes.add('ipAddress')
    maskedText = maskedText.replace(PII_PATTERNS.ipAddress, preserveStructure ? '[IP]' : '[REDACTED]')
  }

  // Mask IBAN
  if (PII_PATTERNS.iban.test(maskedText)) {
    detectedTypes.add('iban')
    maskedText = maskedText.replace(PII_PATTERNS.iban, preserveStructure ? '[IBAN]' : '[REDACTED]')
  }

  // Mask passport numbers
  if (PII_PATTERNS.passport.test(maskedText)) {
    detectedTypes.add('passport')
    maskedText = maskedText.replace(PII_PATTERNS.passport, preserveStructure ? '[PASSPORT]' : '[REDACTED]')
  }

  // Mask tax IDs
  if (PII_PATTERNS.taxId.test(maskedText)) {
    detectedTypes.add('taxId')
    maskedText = maskedText.replace(PII_PATTERNS.taxId, preserveStructure ? '[TAX_ID]' : '[REDACTED]')
  }

  // Check for personal identifier field names in structured data
  const lowerText = maskedText.toLowerCase()
  for (const identifier of PERSONAL_IDENTIFIERS) {
    if (lowerText.includes(identifier)) {
      detectedTypes.add('personal_identifier')
      break
    }
  }

  return {
    hasPII: detectedTypes.size > 0,
    maskedText,
    detectedTypes: Array.from(detectedTypes),
    originalLength: text.length,
    maskedLength: maskedText.length
  }
}

/**
 * Validate that text is safe to send to external APIs
 */
export function validateTextForEmbedding(text: string): {
  safe: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  
  const piiResult = maskPII(text, false)
  
  if (piiResult.hasPII) {
    warnings.push(`Detected PII: ${piiResult.detectedTypes.join(', ')}`)
  }

  // Check for sensitive keywords
  const sensitiveKeywords = [
    'password', 'secret', 'token', 'api_key', 'private_key',
    'confidential', 'classified', 'medical record'
  ]

  const lowerText = text.toLowerCase()
  for (const keyword of sensitiveKeywords) {
    if (lowerText.includes(keyword)) {
      warnings.push(`Contains sensitive keyword: ${keyword}`)
    }
  }

  return {
    safe: warnings.length === 0,
    warnings
  }
}

/**
 * Prepare text for embedding by masking PII
 * Returns masked text safe for external API calls
 */
export function prepareTextForEmbedding(text: string): {
  maskedText: string
  hadPII: boolean
  piiTypes: string[]
} {
  const result = maskPII(text, true)
  
  return {
    maskedText: result.maskedText,
    hadPII: result.hasPII,
    piiTypes: result.detectedTypes
  }
}
