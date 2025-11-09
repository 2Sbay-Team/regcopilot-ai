# Regulix API Documentation

## Overview
Comprehensive API reference for Regulix Compliance & ESG Copilot platform.

## Base URL
```
Production: https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1
Development: http://localhost:54321/functions/v1
```

## Authentication

### API Key Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### Generate API Key
**Endpoint**: `POST /generate-api-key`

**Request**:
```json
{
  "partner_account_id": "uuid",
  "key_name": "Production API Key",
  "scopes": ["read:assessments", "write:assessments"],
  "environment": "production"
}
```

**Response**:
```json
{
  "key_id": "uuid",
  "api_key": "pk_prod_xxxxxxxxxxxxx",
  "prefix": "pk_prod_xxxxxx",
  "message": "Save this key securely - it will not be shown again"
}
```

### JWT Authentication
For user-specific operations, use Supabase JWT:
```http
Authorization: Bearer SUPABASE_JWT_TOKEN
```

## Core Modules

### 1. AI Act Auditor

#### Classify AI System
**Endpoint**: `POST /ai-act-auditor`

**Request**:
```json
{
  "system_name": "Customer Service Chatbot",
  "purpose": "Automated customer support responses",
  "use_case": "chatbot",
  "sector": "customer_service",
  "automated_decision_making": true,
  "human_oversight": true
}
```

**Response**:
```json
{
  "assessment_id": "uuid",
  "risk_category": "limited",
  "confidence_score": 0.92,
  "ai_act_classification": {
    "category": "Limited Risk",
    "obligations": [
      "Transparency requirements",
      "User notification of AI interaction"
    ]
  },
  "annex_iv_items": [
    "Data governance",
    "Technical documentation",
    "Record-keeping"
  ],
  "reasoning": "System provides customer support..."
}
```

#### Generate Annex IV Report
**Endpoint**: `POST /generate-annex-iv-report`

**Request**:
```json
{
  "assessment_id": "uuid",
  "include_evidence": true
}
```

**Response**:
```json
{
  "report_id": "uuid",
  "report_type": "annex_iv",
  "risk_category": "limited",
  "signed_hash": "sha256_hash",
  "generated_at": "2025-01-09T10:00:00Z",
  "annex_iv_items": [...],
  "evidence_summary": "...",
  "pdf_url": "/reports/annex-iv-uuid.pdf"
}
```

### 2. GDPR Checker

#### Scan Document for PII
**Endpoint**: `POST /gdpr-checker`

**Request**:
```json
{
  "document_text": "John Smith, email: john@company.com",
  "document_id": "uuid",
  "scan_type": "pii_detection"
}
```

**Response**:
```json
{
  "assessment_id": "uuid",
  "violations": [
    {
      "type": "unencrypted_email",
      "severity": "medium",
      "location": "line 1",
      "recommendation": "Encrypt or pseudonymize email addresses"
    }
  ],
  "pii_detected": {
    "names": ["John Smith"],
    "emails": ["john@company.com"],
    "phone_numbers": [],
    "addresses": []
  },
  "compliance_score": 0.75,
  "summary": "Document contains PII that requires protection"
}
```

#### Process DSAR Request
**Endpoint**: `POST /process-dsar-request`

**Request**:
```json
{
  "data_subject_email": "john@example.com",
  "request_type": "access",
  "verification_method": "email_verification"
}
```

**Response**:
```json
{
  "request_id": "uuid",
  "status": "pending_verification",
  "verification_sent_at": "2025-01-09T10:00:00Z",
  "estimated_completion": "2025-01-14T10:00:00Z"
}
```

### 3. ESG Reporter

#### Analyze ESG Metrics
**Endpoint**: `POST /esg-reporter`

**Request**:
```json
{
  "metrics": {
    "co2_emissions_tons": 500,
    "energy_consumption_mwh": 1200,
    "renewable_energy_percent": 30,
    "female_leadership_percent": 35,
    "employee_turnover_percent": 12
  },
  "reporting_period": "2024-Q4"
}
```

**Response**:
```json
{
  "report_id": "uuid",
  "esrs_compliance": {
    "E1_climate_change": 0.82,
    "S1_workforce": 0.75,
    "G1_governance": 0.88
  },
  "recommendations": [
    "Increase renewable energy adoption",
    "Improve gender diversity in leadership"
  ],
  "narrative": "Organization demonstrates strong governance...",
  "completeness_score": 0.85
}
```

#### Extract ESG Metrics from Document
**Endpoint**: `POST /extract-esg-metrics`

**Request**:
```json
{
  "document_url": "s3://bucket/sustainability-report.pdf"
}
```

**Response**:
```json
{
  "extracted_metrics": {
    "co2_emissions_tons": 450,
    "energy_consumption_mwh": 1150,
    "water_consumption_m3": 50000
  },
  "confidence_scores": {
    "co2_emissions_tons": 0.95,
    "energy_consumption_mwh": 0.92
  },
  "source_pages": [5, 12, 18]
}
```

### 4. RAG Search

#### Semantic Search
**Endpoint**: `POST /rag-search`

**Request**:
```json
{
  "query": "What are AI Act obligations for high-risk systems?",
  "source_filter": ["EU_AI_ACT", "GDPR"],
  "max_results": 5
}
```

**Response**:
```json
{
  "results": [
    {
      "chunk_id": "uuid",
      "content": "High-risk AI systems must comply with...",
      "source": "EU_AI_ACT",
      "section": "Article 16",
      "similarity_score": 0.89,
      "metadata": {
        "article": "16",
        "chapter": "III"
      }
    }
  ],
  "query_time_ms": 45
}
```

#### Upload Regulation Document
**Endpoint**: `POST /process-regulation-pdf`

**Request** (multipart/form-data):
```
file: regulation.pdf
source_name: "EU AI Act"
category: "ai_regulation"
```

**Response**:
```json
{
  "document_id": "uuid",
  "chunks_created": 156,
  "processing_time_ms": 3200,
  "status": "completed"
}
```

### 5. Audit Trail

#### Log Audit Entry
**Endpoint**: `POST /audit-trail` (internal)

**Request**:
```json
{
  "module": "ai_act",
  "action": "generate_report",
  "input_hash": "sha256_hash",
  "output_hash": "sha256_hash",
  "reasoning": "Generated Annex IV report for system XYZ"
}
```

**Response**:
```json
{
  "log_id": "uuid",
  "prev_hash": "previous_output_hash",
  "output_hash": "current_output_hash",
  "timestamp": "2025-01-09T10:00:00Z",
  "chain_valid": true
}
```

#### Verify Audit Chain
**Endpoint**: `POST /audit-chain-verify`

**Request**:
```json
{
  "organization_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2025-01-09"
}
```

**Response**:
```json
{
  "chain_valid": true,
  "total_entries": 1523,
  "verified_entries": 1523,
  "first_entry": "2024-01-01T00:00:00Z",
  "last_entry": "2025-01-09T10:00:00Z",
  "chain_hash": "final_hash"
}
```

### 6. Connectors

#### Sync Connector Data
**Endpoint**: `POST /connector-sync`

**Request**:
```json
{
  "connector_id": "uuid",
  "sync_type": "incremental"
}
```

**Response**:
```json
{
  "sync_id": "uuid",
  "status": "in_progress",
  "files_synced": 23,
  "bytes_transferred": 15728640,
  "estimated_completion": "2025-01-09T10:15:00Z"
}
```

#### Validate Connector
**Endpoint**: `POST /connector-validate`

**Request**:
```json
{
  "connector_type": "sharepoint",
  "credentials": {
    "tenant_id": "uuid",
    "client_id": "uuid",
    "client_secret": "encrypted"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "test_connection": "success",
  "permissions": ["read", "list"],
  "accessible_sites": 5
}
```

### 7. Data Lineage

#### Get Lineage Graph
**Endpoint**: `POST /data-lineage`

**Request**:
```json
{
  "entity_id": "uuid",
  "entity_type": "ai_model",
  "depth": 3
}
```

**Response**:
```json
{
  "nodes": [
    {
      "id": "uuid",
      "type": "ai_model",
      "name": "Customer Chatbot v2",
      "properties": {...}
    },
    {
      "id": "uuid",
      "type": "dataset",
      "name": "Training Data 2024"
    }
  ],
  "edges": [
    {
      "from": "dataset_uuid",
      "to": "model_uuid",
      "relationship": "trained_on"
    }
  ]
}
```

## Partner API

### Partner Account Management

#### Create Partner Account
**Endpoint**: `POST /partner-accounts` (Admin only)

**Request**:
```json
{
  "company_name": "Acme Consulting",
  "tier": "gold",
  "monthly_quota": 100000
}
```

**Response**:
```json
{
  "partner_id": "uuid",
  "api_keys": [],
  "tier": "gold",
  "monthly_quota": 100000,
  "status": "active"
}
```

### Usage Analytics

#### Get Token Usage
**Endpoint**: `GET /usage/{organization_id}`

**Query Parameters**:
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `model_filter`: Optional model name filter

**Response**:
```json
{
  "organization_id": "uuid",
  "period": {
    "start": "2024-01-01",
    "end": "2025-01-09"
  },
  "total_tokens": 1500000,
  "total_cost": 45.50,
  "by_model": {
    "gpt-4": {
      "tokens": 500000,
      "cost": 25.00
    },
    "gemini-pro": {
      "tokens": 1000000,
      "cost": 20.50
    }
  }
}
```

## Webhooks

### Event Types
- `assessment.created` - New compliance assessment
- `report.generated` - Report generation complete
- `dsar.completed` - DSAR request fulfilled
- `audit.violation` - Audit chain integrity issue

### Webhook Payload
```json
{
  "event": "assessment.created",
  "timestamp": "2025-01-09T10:00:00Z",
  "organization_id": "uuid",
  "data": {
    "assessment_id": "uuid",
    "module": "ai_act",
    "risk_category": "high"
  }
}
```

### Configure Webhook
**Endpoint**: `POST /webhooks`

**Request**:
```json
{
  "url": "https://api.example.com/webhook",
  "events": ["assessment.created", "report.generated"],
  "secret": "webhook_signing_secret"
}
```

## Rate Limits

### Default Limits
- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Business Tier**: 10,000 requests/hour
- **Enterprise**: Custom limits

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1704805200
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Assessment ID is required",
    "details": {
      "field": "assessment_id",
      "reason": "missing_required_field"
    }
  }
}
```

### Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable

## SDKs and Examples

### JavaScript/TypeScript
```typescript
import { RegulixClient } from '@regulix/sdk'

const client = new RegulixClient({
  apiKey: process.env.REGULIX_API_KEY
})

const assessment = await client.aiAct.classify({
  system_name: "Chatbot",
  purpose: "Customer support"
})
```

### Python
```python
from regulix import RegulixClient

client = RegulixClient(api_key=os.getenv('REGULIX_API_KEY'))

assessment = client.ai_act.classify(
    system_name="Chatbot",
    purpose="Customer support"
)
```

### cURL
```bash
curl -X POST \
  https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1/ai-act-auditor \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "system_name": "Chatbot",
    "purpose": "Customer support"
  }'
```

## Support

- **Documentation**: https://docs.regulix.com
- **API Status**: https://status.regulix.com
- **Support Email**: api-support@regulix.com
- **Developer Forum**: https://community.regulix.com

---

**API Version**: v1.0.0
**Last Updated**: 2025-01-09
