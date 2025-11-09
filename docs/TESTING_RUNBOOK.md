# RegTech Compliance Copilot - Testing Runbook

## Quick Start

### Run All Tests
```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Security tests only
npm run test src/test/security/

# Edge function integration tests
deno test --allow-net --allow-env supabase/functions/_tests/
```

## Test Suites

### 1. Unit Tests (Vitest)
**Location**: `src/**/*.test.{ts,tsx}`

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode
npm run test -- --watch
```

**Coverage Target**: 80%+

### 2. Integration Tests (Deno)
**Location**: `supabase/functions/_tests/`

```bash
# Set environment variables
export SUPABASE_URL="your-url"
export SUPABASE_ANON_KEY="your-key"

# Run all integration tests
deno test --allow-net --allow-env supabase/functions/_tests/

# Run specific test
deno test --allow-net --allow-env supabase/functions/_tests/ai-act-auditor.test.ts
```

### 3. E2E Tests (Playwright)
**Location**: `e2e/**/*.spec.ts`

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:headed

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### 4. Security Tests
**Location**: `src/test/security/`

```bash
# OWASP Top 10
npm run test src/test/security/owasp-top-10.test.ts

# RLS Policies
npm run test src/test/security/rls-policies.test.ts

# JWT Validation
npm run test src/test/security/jwt-validation.test.ts

# PII Masking
npm run test src/test/security/pii-masking.test.ts

# Audit Chain
npm run test src/test/security/audit-chain-integrity.test.ts
```

## Test Reports

### Generate Coverage Report
```bash
npm run test:coverage
# Open coverage/index.html
```

### Generate Playwright Report
```bash
npx playwright show-report
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run test:e2e
```

## Security Testing Schedule

- **Daily**: Unit tests + Integration tests
- **Weekly**: Full security suite
- **Monthly**: Penetration testing
- **Quarterly**: External security audit

---

**Last Updated**: 2025-11-09  
**Version**: 1.0
