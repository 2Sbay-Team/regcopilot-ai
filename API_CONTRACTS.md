# API Contracts
## RegSense Compliance Copilot Platform

---

## 🌐 API Overview

**Base URL (Production):** `https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1`  
**Authentication:** JWT Bearer Token (Supabase Auth)  
**Content-Type:** `application/json`  
**Rate Limits:** Varies by endpoint (see individual specs)

---

## 🔐 Authentication

### Headers Required

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Supabase anon key)
```

### Error Responses

```json
// 401 Unauthorized
{
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}

// 403 Forbidden
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "required_role": "admin"
}

// 429 Rate Limit Exceeded
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retry_after_seconds": 60
}
```

---

## 📋 Compliance Modules

### AI Act Auditor

#### `POST /ai-act-auditor`

Classifies AI systems according to EU AI Act risk categories and generates conformity assessment.

**Request:**

```json
{
  "system_name": "Customer Recommendation Engine",
  "purpose": "Product recommendations based on browsing history",
  "data_sources": ["user_clicks", "purchase_history"],
  "high_risk_use_case": false,
  "deployment_context": "e-commerce",
  "organization_id": "uuid"
}
```

**Response:**

```json
{
  "assessment_id": "uuid",
  "risk_category": "limited",
  "confidence": 0.92,
  "reasoning": "System provides product recommendations which constitutes limited risk under ANNEX III...",
  "applicable_requirements": [
    "Transparency obligations (Article 52)",
    "Record-keeping (Article 12)"
  ],
  "recommended_actions": [
    "Implement transparency notice",
    "Establish logging mechanism"
  ],
  "citations": [
    {
      "article": "Article 6(2)",
      "text": "AI systems intended to be used for...",
      "source": "EU AI Act"
    }
  ],
  "created_at": "2024-11-12T10:30:00Z"
}
```

**Error Codes:**
- `400`: Invalid input (missing required fields)
- `401`: Unauthorized
- `429`: AI Gateway rate limit exceeded
- `500`: Internal processing error

**Rate Limit:** 30 requests/minute per organization

---

### GDPR Checker

#### `POST /gdpr-checker`

Scans documents or text for personal data and GDPR compliance issues.

**Request:**

```json
{
  "content_type": "document",
  "text": null,
  "file_path": "gdpr-documents/org-123/policy.pdf",
  "scan_depth": "comprehensive",
  "organization_id": "uuid"
}
```

**Response:**

```json
{
  "assessment_id": "uuid",
  "pii_detected": true,
  "pii_categories": [
    {
      "category": "email_address",
      "count": 12,
      "confidence": 0.98,
      "locations": ["page 3", "page 7"]
    },
    {
      "category": "name",
      "count": 45,
      "confidence": 0.95,
      "locations": ["throughout"]
    }
  ],
  "violations": [
    {
      "type": "missing_legal_basis",
      "severity": "high",
      "description": "No clear legal basis stated for processing personal data",
      "article": "Article 6",
      "recommendation": "Add explicit legal basis section"
    }
  ],
  "compliance_score": 72,
  "summary": "Document contains personal data with some GDPR compliance gaps...",
  "created_at": "2024-11-12T10:35:00Z"
}
```

**Error Codes:**
- `400`: Invalid content or file path
- `401`: Unauthorized
- `404`: File not found
- `429`: Rate limit exceeded

**Rate Limit:** 20 requests/minute per organization

---

### ESG Reporter

#### `POST /esg-reporter`

Generates comprehensive ESG reports based on uploaded or synced data.

**Request:**

```json
{
  "organization_id": "uuid",
  "reporting_period": "2024",
  "metrics": {
    "scope1_emissions": 1234.5,
    "scope2_emissions": 567.8,
    "scope3_emissions": 3456.9,
    "renewable_energy_pct": 45,
    "water_consumption": 12000,
    "waste_generated": 450,
    "waste_recycled_pct": 65,
    "employee_count": 250,
    "diversity_metrics": {
      "women_leadership_pct": 38,
      "minority_representation_pct": 22
    }
  },
  "include_narrative": true
}
```

**Response:**

```json
{
  "report_id": "uuid",
  "completeness_score": 85,
  "calculated_metrics": {
    "total_ghg_emissions": 5259.2,
    "emissions_intensity": 21.04,
    "renewable_energy_ratio": 0.45
  },
  "narrative": {
    "executive_summary": "In 2024, the organization achieved a 12% reduction in Scope 1 emissions...",
    "e1_climate_change": "Direct GHG emissions totaled 1,234.5 tCO2e...",
    "s1_own_workforce": "The organization employed 250 people with 38% women in leadership..."
  },
  "citations": [
    {
      "section": "E1",
      "esrs_ref": "ESRS E1.7",
      "description": "Scope 1 GHG emissions calculation follows..."
    }
  ],
  "anomalies": [
    {
      "metric": "scope3_emissions",
      "severity": "medium",
      "message": "Scope 3 emissions 15% higher than industry average",
      "recommendation": "Review supply chain emissions data"
    }
  ],
  "created_at": "2024-11-12T10:40:00Z"
}
```

**Error Codes:**
- `400`: Invalid metrics or period
- `402`: Token quota exceeded (requires top-up)
- `429`: Rate limit exceeded

**Rate Limit:** 10 requests/hour per organization

---

### RAG Search Engine

#### `POST /rag-search`

Semantic search across regulatory documents using vector embeddings.

**Request:**

```json
{
  "query": "What are the transparency requirements for limited risk AI systems?",
  "scope": ["EU_AI_ACT", "GDPR"],
  "match_threshold": 0.75,
  "match_count": 5
}
```

**Response:**

```json
{
  "results": [
    {
      "chunk_id": "uuid",
      "content": "Article 52: Transparency obligations for certain AI systems...",
      "section": "Article 52",
      "source": "EU AI Act",
      "similarity": 0.89,
      "metadata": {
        "article_number": "52",
        "chapter": "VI"
      }
    }
  ],
  "query_embedding_time_ms": 45,
  "search_time_ms": 123,
  "total_chunks_searched": 1247
}
```

**Error Codes:**
- `400`: Invalid query or scope
- `429`: Rate limit exceeded

**Rate Limit:** 60 requests/minute per organization

---

## 🔄 Data Management

### Connector Sync

#### `POST /connector-sync`

Synchronizes data from external sources (S3, SharePoint, SAP, etc.).

**Request:**

```json
{
  "connector_id": "uuid",
  "sync_type": "delta",
  "force_full_sync": false
}
```

**Response:**

```json
{
  "sync_id": "uuid",
  "status": "completed",
  "records_fetched": 1500,
  "records_inserted": 1425,
  "records_updated": 75,
  "records_failed": 0,
  "duration_ms": 124567,
  "next_sync_at": "2024-11-13T10:00:00Z",
  "errors": []
}
```

**Error Codes:**
- `400`: Invalid connector ID
- `401`: Connector authentication failed
- `429`: Sync already in progress

**Rate Limit:** 5 requests/minute per connector

---

### Mapping Suggest

#### `POST /mapping-suggest`

Auto-generates field-to-metric mappings for ESG data.

**Request:**

```json
{
  "connector_ids": ["uuid1", "uuid2"],
  "organization_id": "uuid"
}
```

**Response:**

```json
{
  "mapping_profile_id": "uuid",
  "tables_identified": 5,
  "joins_suggested": 3,
  "fields_mapped": 42,
  "mappings": [
    {
      "source_table": "energy_consumption",
      "source_column": "kwh_consumed",
      "target_metric": "E1-2.energy",
      "confidence": 0.92,
      "suggested_transform": "kWh_to_MWh",
      "suggested_unit": "MWh"
    }
  ],
  "requires_review": true
}
```

**Error Codes:**
- `400`: Invalid connector IDs
- `404`: Schema cache not found

**Rate Limit:** 10 requests/hour per organization

---

### KPI Evaluate

#### `POST /kpi-evaluate`

Calculates ESG KPIs based on defined rules and staging data.

**Request:**

```json
{
  "organization_id": "uuid",
  "period": "2024-Q4",
  "kpi_rules": ["E1-1", "E1-2", "S1-1"]
}
```

**Response:**

```json
{
  "evaluation_id": "uuid",
  "kpis_calculated": 28,
  "results": [
    {
      "metric_code": "E1-1.scope1",
      "value": 1234.5,
      "unit": "tCO2e",
      "period": "2024-Q4",
      "quality_flag": "validated",
      "data_sources": ["connector-1", "connector-2"]
    }
  ],
  "duration_ms": 8934
}
```

**Error Codes:**
- `400`: Invalid period or rules
- `404`: No staging data available

**Rate Limit:** 20 requests/hour per organization

---

## 🔍 Audit & Governance

### Audit Chain Verify

#### `POST /audit-chain-verify`

Verifies integrity of hash-chained audit logs.

**Request:**

```json
{
  "organization_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-11-12"
}
```

**Response:**

```json
{
  "verification_id": "uuid",
  "total_entries": 5431,
  "verified_entries": 5431,
  "broken_chains": 0,
  "integrity_status": "intact",
  "first_entry_hash": "abc123...",
  "last_entry_hash": "def456...",
  "verification_time_ms": 2341
}
```

**Error Codes:**
- `400`: Invalid date range
- `500`: Integrity verification failed

**Rate Limit:** 10 requests/hour per organization

---

### Model Registry

#### `GET /model-governance`

Retrieves AI model catalog and governance information.

**Query Parameters:**
- `organization_id`: uuid (required)
- `status`: string (optional) - `active`, `deprecated`, `archived`
- `risk_level`: string (optional) - `minimal`, `limited`, `high`, `prohibited`

**Response:**

```json
{
  "models": [
    {
      "model_id": "uuid",
      "model_name": "Customer Segmentation v2.1",
      "model_type": "classification",
      "risk_category": "limited",
      "last_validated": "2024-10-15",
      "performance_metrics": {
        "accuracy": 0.87,
        "f1_score": 0.85
      },
      "bias_assessment": {
        "protected_attributes": ["age", "gender"],
        "disparate_impact_ratio": 0.92,
        "status": "acceptable"
      },
      "documentation_url": "https://..."
    }
  ],
  "total_count": 12
}
```

**Error Codes:**
- `400`: Invalid filters
- `404`: Organization not found

**Rate Limit:** 60 requests/minute

---

## 🤖 Automation & Agents

### Agent Runner

#### `POST /agent-runner`

Manually triggers agent queue processing.

**Request:**

```json
{
  "trigger_source": "manual",
  "priority_filter": 3
}
```

**Response:**

```json
{
  "run_id": "uuid",
  "tasks_processed": 23,
  "tasks_completed": 21,
  "tasks_failed": 2,
  "duration_ms": 45678,
  "failures": [
    {
      "task_id": "uuid",
      "error": "AI Gateway timeout",
      "retry_scheduled": true
    }
  ]
}
```

**Error Codes:**
- `429`: Agent runner already active

**Rate Limit:** 5 requests/minute (system-wide)

---

## 📊 Analytics & Reporting

### Compliance Score

#### `GET /calculate-compliance-score`

Calculates overall compliance score across all modules.

**Query Parameters:**
- `organization_id`: uuid (required)
- `modules`: comma-separated list (optional) - `ai_act,gdpr,esg`

**Response:**

```json
{
  "overall_score": 82,
  "breakdown": {
    "ai_act": {
      "score": 88,
      "assessments_count": 5,
      "high_risk_systems": 1
    },
    "gdpr": {
      "score": 75,
      "assessments_count": 12,
      "violations_count": 3
    },
    "esg": {
      "score": 83,
      "completeness": 0.85,
      "data_quality": 0.81
    }
  },
  "trend": "improving",
  "last_updated": "2024-11-12T10:45:00Z"
}
```

**Error Codes:**
- `404`: Organization not found

**Rate Limit:** 30 requests/minute

---

## 🔔 Notifications & Webhooks

### Webhook Events

Register webhooks to receive real-time events:

```json
{
  "webhook_url": "https://your-app.com/webhooks/regulix",
  "events": [
    "assessment.completed",
    "report.generated",
    "connector.sync_completed",
    "alert.triggered"
  ],
  "secret": "whsec_...",
  "active": true
}
```

**Event Payload Example:**

```json
{
  "event_type": "assessment.completed",
  "event_id": "uuid",
  "timestamp": "2024-11-12T10:50:00Z",
  "organization_id": "uuid",
  "data": {
    "assessment_id": "uuid",
    "module": "ai_act",
    "risk_category": "limited",
    "requires_action": true
  },
  "signature": "sha256=..."
}
```

---

## 📈 Usage & Billing

### Usage Summary

#### `GET /billing-summary`

Retrieves usage statistics for billing period.

**Query Parameters:**
- `organization_id`: uuid (required)
- `period`: string (optional) - `current`, `previous`

**Response:**

```json
{
  "organization_id": "uuid",
  "billing_period": "2024-11",
  "usage": {
    "ai_gateway": {
      "total_tokens": 450000,
      "total_cost": 12.45,
      "requests_count": 234
    },
    "storage": {
      "total_gb": 5.2,
      "total_cost": 1.04
    },
    "edge_functions": {
      "invocations": 12340,
      "total_cost": 2.47
    }
  },
  "quota": {
    "llm_tokens": 1000000,
    "remaining_tokens": 550000,
    "usage_percentage": 45
  }
}
```

**Error Codes:**
- `404`: Organization not found

**Rate Limit:** 30 requests/minute

---

## 🛡️ Security & Compliance APIs

### Security Audit Scan

#### `POST /security-audit-scan`

Initiates comprehensive security scan.

**Request:**

```json
{
  "organization_id": "uuid",
  "scan_type": "full",
  "include_recommendations": true
}
```

**Response:**

```json
{
  "scan_id": "uuid",
  "findings": [
    {
      "severity": "medium",
      "category": "authentication",
      "issue": "MFA not enabled for 3 users",
      "recommendation": "Enforce MFA for all admin users"
    }
  ],
  "risk_score": 65,
  "compliance_status": {
    "gdpr": "compliant",
    "soc2": "minor_issues",
    "iso27001": "compliant"
  }
}
```

**Error Codes:**
- `401`: Insufficient permissions (admin required)

**Rate Limit:** 5 requests/hour per organization

---

## 📝 Response Schemas

### Standard Error Response

```json
{
  "error": "string",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-11-12T10:55:00Z",
  "request_id": "uuid"
}
```

### Pagination

For paginated endpoints:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total_count": 234,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## 🔗 Related Documentation

- [Architecture Overview](./ARCHITECTURE_OVERVIEW.md)
- [Authentication Guide](./docs/API_DOCUMENTATION.md)
- [Rate Limiting Policy](./docs/API_DOCUMENTATION.md)
