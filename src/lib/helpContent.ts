import { Shield, FileCheck, Leaf, Mail, Network, Database, Bot, Eye, GitBranch } from "lucide-react"

export const moduleHelpContent = {
  "ai-act": {
    title: "EU AI Act Auditor",
    description: "Automated risk classification & compliance for AI systems",
    icon: Shield,
    guide: {
      overview: "The EU AI Act Auditor helps you classify AI systems according to EU Regulation 2024/1689 and generate comprehensive compliance documentation. It automatically identifies high-risk AI systems and provides detailed Annex IV technical documentation.",
      steps: [
        {
          title: "Provide System Information",
          description: "Enter your AI system's name, purpose, and the sector it operates in. Be specific about what decisions the AI makes and what data it processes."
        },
        {
          title: "Risk Classification",
          description: "The AI analyzes your input and classifies the system as Unacceptable Risk, High Risk, Limited Risk, or Minimal Risk based on EU AI Act criteria."
        },
        {
          title: "Review Compliance Summary",
          description: "Examine the AI-generated compliance report that explains the risk classification reasoning and identifies applicable requirements."
        },
        {
          title: "Access Evidence & Citations",
          description: "View the regulatory citations and evidence used to support the assessment findings."
        },
        {
          title: "Generate Documentation",
          description: "Export Annex IV technical documentation and conformity reports for regulatory submission."
        }
      ],
      tips: [
        "High-risk sectors include employment, biometric identification, law enforcement, education, and critical infrastructure. Systems in these sectors face stricter requirements.",
        "Be specific about automated decision-making capabilities. The more detail you provide about how the AI makes decisions, the more accurate the risk classification.",
        "Upload existing documentation (Annex IV docs, system specs) to auto-fill form fields and speed up the assessment process.",
        "For high-risk systems, you'll need to maintain continuous documentation. The platform generates audit-trail entries for every assessment to support ongoing compliance."
      ],
      examples: [
        {
          title: "HR Recruitment AI - High Risk",
          description: "AI system for screening job applicants",
          input: `System Name: "TalentMatch AI"
Purpose: "Analyzes resumes and ranks candidates based on skills, experience, and cultural fit using NLP and ML models"
Sector: "employment"`,
          output: `Risk Classification: HIGH RISK
Reason: Employment sector AI system that makes automated decisions affecting hiring
Required Compliance:
- Annex IV Technical Documentation
- Fundamental Rights Impact Assessment
- Human Oversight Mechanisms
- Transparency Obligations (Art. 13)
- EU Database Registration`
        },
        {
          title: "Customer Service Chatbot - Limited Risk",
          description: "AI chatbot for answering customer questions",
          input: `System Name: "SupportBot"
Purpose: "Answers customer questions about products and services, provides troubleshooting guidance"
Sector: "customer_service"`,
          output: `Risk Classification: LIMITED RISK
Reason: AI system that interacts with humans (chatbot) but doesn't make high-risk decisions
Required Compliance:
- Transparency obligations (Art. 52) - Users must be informed they're interacting with AI
- No Annex IV documentation required
- No EU database registration required`
        }
      ]
    },
    videoUrl: "https://www.youtube.com/watch?v=example-ai-act"
  },
  "gdpr": {
    title: "GDPR / DSGVO Checker",
    description: "Scan for personal data & compliance issues",
    icon: FileCheck,
    guide: {
      overview: "The GDPR Checker scans documents and text for personal data processing compliance with EU Regulation 2016/679 (GDPR). It identifies personal data, detects violations, and provides remediation recommendations.",
      steps: [
        {
          title: "Input Documents or Text",
          description: "Paste text directly or upload documents (PDF, DOCX, CSV) that contain or reference personal data processing activities."
        },
        {
          title: "AI Scans for Personal Data",
          description: "The system identifies personal data categories (names, emails, IDs, health data, biometrics) and assesses legal basis for processing."
        },
        {
          title: "Review Violations",
          description: "Examine detected GDPR violations with article references (Art. 5, 6, 9, etc.) and severity classifications."
        },
        {
          title: "Implement Recommendations",
          description: "Follow the remediation guidance to address identified compliance gaps."
        }
      ],
      tips: [
        "Include context about data processing purposes and legal basis. The more information you provide about why and how data is processed, the more accurate the compliance check.",
        "Special categories of personal data (health, biometric, genetic) require explicit consent or specific legal basis under Article 9.",
        "Cross-border data transfers outside the EU require appropriate safeguards like Standard Contractual Clauses (SCCs) or adequacy decisions.",
        "Missing data protection measures (encryption, pseudonymization) are common violations. Ensure technical and organizational measures are documented."
      ],
      examples: [
        {
          title: "Employee Database - Multiple Violations",
          description: "HR database with personal data",
          input: `We store employee names, addresses, social security numbers, health insurance information, and performance reviews in an Excel spreadsheet accessible to all managers.`,
          output: `Violations Detected: 3
1. [HIGH] Art. 32 - Inadequate Security Measures
   Excel spreadsheet lacks encryption and access controls
2. [HIGH] Art. 9 - Special Category Data (Health)
   Health insurance data requires explicit consent or Art. 9 exemption
3. [MEDIUM] Art. 5(1)(f) - Excessive Access
   All managers shouldn't have access to all employee data`
        }
      ]
    }
  },
  "esg": {
    title: "ESG Reporter",
    description: "Generate CSRD/ESRS sustainability reports",
    icon: Leaf,
    guide: {
      overview: "The ESG Reporter helps you calculate environmental, social, and governance metrics and generate narratives compliant with the EU Corporate Sustainability Reporting Directive (CSRD) and European Sustainability Reporting Standards (ESRS).",
      steps: [
        {
          title: "Enter Reporting Period",
          description: "Specify the fiscal year or quarter you're reporting on (e.g., '2024-FY', 'Q1-2025')."
        },
        {
          title: "Input Emissions Data",
          description: "Provide Scope 1 (direct), Scope 2 (electricity), and Scope 3 (supply chain) emissions in tonnes of CO2 equivalent."
        },
        {
          title: "Add Energy Metrics",
          description: "Enter total energy consumption in MWh, including electricity, gas, and renewable sources."
        },
        {
          title: "Upload Supporting Data",
          description: "Optionally upload CSV/Excel files with detailed metrics (diversity, water, waste, social indicators)."
        },
        {
          title: "Generate Report",
          description: "The AI calculates KPIs, checks ESRS alignment, and generates a compliance narrative."
        }
      ],
      tips: [
        "Scope 3 emissions are often the largest but hardest to measure. Include estimates for business travel, employee commuting, and purchased goods.",
        "ESRS requires double materiality assessment: both financial impact on your business AND your impact on environment/society.",
        "The completeness score indicates how much of ESRS standards you're covering. Aim for 80%+ for comprehensive reporting.",
        "Upload historical data to show year-over-year trends, which strengthens your sustainability narrative."
      ],
      examples: [
        {
          title: "Manufacturing Company - Annual Report",
          description: "CSRD-compliant ESG report",
          input: `Reporting Period: 2024-FY
Scope 1: 450 tCO2e
Scope 2: 890 tCO2e
Scope 3: 2,100 tCO2e
Energy: 6,200 MWh`,
          output: `Completeness Score: 85%
Total Carbon Footprint: 3,440 tCO2e
Carbon Intensity: 0.55 tCO2e per MWh
ESRS Alignment: E1 (Climate), E2 (Pollution), E3 (Water), E4 (Biodiversity), E5 (Circular Economy)
Narrative: "In FY 2024, our organization achieved significant progress in decarbonization..."`
        }
      ]
    }
  },
  "dsar": {
    title: "DSAR Management",
    description: "Handle data subject access requests (GDPR Art. 15-20)",
    icon: Mail,
    guide: {
      overview: "DSAR Management automates the fulfillment of Data Subject Access Requests under GDPR Articles 15-20. It searches connected systems, aggregates data, and generates responses within the legally required 30-day deadline.",
      steps: [
        {
          title: "Create DSAR Request",
          description: "Enter the data subject's email and select the request type (access, rectification, erasure, portability, restriction)."
        },
        {
          title: "30-Day Deadline Starts",
          description: "The system automatically tracks the 30-day compliance deadline and sends alerts for approaching deadlines."
        },
        {
          title: "Fulfill Request",
          description: "Click 'Fulfill Request' to automatically search configured systems (CRM, analytics, marketing) for the data subject's information."
        },
        {
          title: "Review Aggregated Data",
          description: "The AI compiles data from multiple sources and generates a summary response."
        },
        {
          title: "Deliver Response",
          description: "Export the response package for delivery to the data subject within the deadline."
        }
      ],
      tips: [
        "Under GDPR Article 12.3, you must respond within 30 days (extendable to 60 days in complex cases with justification).",
        "Right to Erasure ('Right to be Forgotten') has exceptions: you can refuse if data is required for legal obligations or public interest.",
        "Data Portability (Art. 20) only applies to data you process based on consent or contract, not legal obligation.",
        "Keep detailed logs of DSAR fulfillment in the audit trail to demonstrate GDPR compliance to regulators."
      ],
      examples: [
        {
          title: "Access Request - Former Employee",
          description: "Employee requesting all personal data",
          input: `Email: john.doe@example.com
Type: Access (Art. 15)
Systems: HR, Email Archives, Badge Logs`,
          output: `Found: 847 records across 3 systems
- HR System: Employment contract, payroll data, performance reviews
- Email: 2,340 emails sent/received
- Badge Logs: 523 facility access entries
Status: Response prepared (Day 12 of 30)
Next: Review and deliver response package`
        }
      ]
    }
  },
  "dora": {
    title: "DORA Compliance Copilot",
    description: "Digital operational resilience for financial institutions",
    icon: Network,
    guide: {
      overview: "The DORA Copilot assesses digital operational resilience for financial institutions under EU Regulation 2022/2554. It evaluates ICT risk management, third-party provider oversight, incident reporting, and resilience testing frameworks.",
      steps: [
        {
          title: "Institution Details",
          description: "Provide your institution name and type (bank, investment firm, insurance, payment institution)."
        },
        {
          title: "Critical ICT Services",
          description: "List your critical ICT services and systems (core banking, trading, customer portals, payment processing)."
        },
        {
          title: "Third-Party Providers",
          description: "Identify critical ICT third-party service providers (cloud, software vendors, data centers)."
        },
        {
          title: "Resilience Measures",
          description: "Describe incident management, testing frequency, recovery time objectives (RTO), and business continuity plans."
        },
        {
          title: "Assessment Results",
          description: "Review compliance score, risk classification, and recommendations for improvement."
        }
      ],
      tips: [
        "DORA requires reporting major ICT incidents to regulators within 4 hours of detection.",
        "Conduct resilience testing at least annually, including penetration testing and scenario-based testing.",
        "Maintain up-to-date ICT risk registers with all identified threats, vulnerabilities, and controls.",
        "Third-party ICT service providers must be subject to contractual arrangements ensuring DORA compliance."
      ],
      examples: [
        {
          title: "Regional Bank - DORA Assessment",
          description: "Digital resilience evaluation",
          input: `Institution: Regional Community Bank
Type: Credit Institution / Bank
Critical ICT: Core banking system, mobile app, ATM network
Third-Parties: AWS (infrastructure), FIS (core banking), Visa (payments)
Testing: Annually
RTO: 4 hours`,
          output: `Compliance Score: 72/100
Risk Classification: MEDIUM
Key Findings:
✓ Adequate third-party oversight
✓ Annual testing in place
✗ Incident reporting procedures incomplete (4-hour requirement)
✗ Business continuity plan lacks detailed ICT recovery procedures
Recommendations:
1. Implement automated incident detection and reporting workflow
2. Enhance BCP with specific ICT recovery steps and RTO/RPO targets`
        }
      ]
    }
  }
}
