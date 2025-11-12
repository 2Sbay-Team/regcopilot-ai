export interface SEOMetadata {
  title: string
  description: string
  keywords?: string
  author?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  canonical?: string
}

export const defaultSEO: SEOMetadata = {
  title: 'LaterneX — AI-Powered Regulatory Intelligence',
  description: 'LaterneX makes compliance effortless. The AI Copilot for GDPR, EU AI Act, and ESG reporting — built for enterprise-grade security and trust.',
  keywords: 'AI compliance, GDPR checker, EU AI Act, ESG reporting, data protection, enterprise compliance, regulatory intelligence',
  author: 'LaterneX',
  ogType: 'website',
  ogImage: '/favicon.png'
}

export const pageSEO: Record<string, SEOMetadata> = {
  home: {
    title: 'LaterneX — AI-Powered Regulatory Intelligence',
    description: 'Making compliance effortless. The AI Copilot for smarter compliance across EU AI Act, GDPR & ESG reporting.',
    keywords: 'AI compliance, regulatory intelligence, GDPR, AI Act, ESG reporting',
    ogType: 'website'
  },
  products: {
    title: 'Compliance Solutions for Enterprises | LaterneX',
    description: 'Explore LaterneX tools for governance, risk, and ESG management. AI Act compliance, GDPR checker, ESG reporting, and more.',
    keywords: 'compliance tools, AI Act compliance, GDPR checker, ESG reporting, audit trail, RAG analysis',
    ogType: 'website'
  },
  trustCenter: {
    title: 'Trust Center — Security & Compliance | LaterneX',
    description: 'Learn about LaterneX security measures, certifications (SOC 2, ISO 27001), data protection, and compliance standards. EU-based infrastructure.',
    keywords: 'trust center, security certifications, SOC 2, ISO 27001, GDPR compliance, data security',
    ogType: 'website'
  },
  about: {
    title: 'About LaterneX — EU-Based Regulatory Intelligence',
    description: 'LaterneX. EU-based, GDPR-native regulatory intelligence platform. Meet our leadership and learn our commitment to compliance.',
    keywords: 'about LaterneX, EU compliance company, GDPR native, regulatory technology',
    ogType: 'website'
  },
  privacy: {
    title: 'Privacy Policy | LaterneX',
    description: 'Our commitment to data protection, GDPR compliance, and transparency. Learn how we collect, process, and protect your data.',
    keywords: 'privacy policy, data protection, GDPR, personal data, data processing',
    ogType: 'article'
  },
  dpa: {
    title: 'Data Processing Agreement (DPA) | LaterneX',
    description: 'Standard contractual clauses for B2B customers. GDPR-compliant data processing agreement with EU data residency.',
    keywords: 'DPA, data processing agreement, GDPR, controller processor, EU data residency',
    ogType: 'article'
  }
}

export function generateJSONLD(type: 'Organization' | 'Product' | 'FAQPage', data?: any) {
  const baseOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'LaterneX',
    'legalName': 'LaterneX',
    'url': 'https://laternex.com',
    'logo': 'https://laternex.com/favicon.png',
    'description': 'AI-Powered Regulatory Intelligence for EU AI Act, GDPR, and ESG compliance',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Box 220',
      'postalCode': '101 23',
      'addressLocality': 'Stockholm',
      'addressCountry': 'SE'
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'Data Protection Officer',
      'email': 'privacy@laternex.com'
    },
    'sameAs': [
      'https://linkedin.com/company/laternex',
      'https://twitter.com/laternex'
    ]
  }

  if (type === 'Organization') {
    return baseOrganization
  }

  if (type === 'Product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'LaterneX',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'EUR'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '127'
      },
      'provider': baseOrganization
    }
  }

  return baseOrganization
}
