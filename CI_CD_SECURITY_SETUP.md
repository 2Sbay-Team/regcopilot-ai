# CI/CD Security Integration Setup

## Overview

Automated security scanning runs on every deployment to detect vulnerabilities, check dependencies, and generate compliance reports.

## GitHub Actions Setup

### 1. Add Secrets to GitHub Repository

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (⚠️ Keep secure!)

### 2. Enable Workflow

The workflow file `.github/workflows/security-scan.yml` is already configured. It will:
- ✅ Run on every push to main/develop branches
- ✅ Run on every pull request
- ✅ Run daily at 2 AM UTC (scheduled)
- ✅ Can be triggered manually via GitHub Actions UI

### 3. Configure Branch Protection (Recommended)

**Settings → Branches → Add rule**

For `main` branch:
- ☑️ Require status checks to pass before merging
- ☑️ Select: `Dependency Security Scan` and `Vulnerability Security Scan`
- ☑️ Block merge if critical vulnerabilities found

### 4. Workflow Features

**On Push/PR:**
- Scans all dependencies for known CVEs
- Runs full vulnerability scan
- Fails build if critical issues found
- Posts summary comment to PRs

**On Main Branch:**
- Generates comprehensive security report
- Updates compliance dashboard
- Archives scan results

**Scheduled (Daily):**
- Catches newly disclosed vulnerabilities
- Monitors for zero-day exploits
- Tracks dependency updates

## GitLab CI Setup

### 1. Add Variables to GitLab Project

Go to: **Settings → CI/CD → Variables → Add variable**

Add these variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (⚠️ Mark as protected & masked)

### 2. Enable Pipeline

The pipeline file `.gitlab-ci.yml` is already configured.

### 3. Configure Pipeline Schedule (Recommended)

**CI/CD → Schedules → New schedule**
- Description: Daily Security Scan
- Interval: `0 2 * * *` (2 AM daily)
- Target branch: `main`

### 4. Configure Merge Request Approval Rules

**Settings → Merge Requests → Merge request approvals**
- ☑️ Require security scan to pass
- ☑️ Block merge if vulnerabilities found

## Webhook Integration (Advanced)

### Custom Deployment Webhooks

Trigger security scans from any CI/CD platform:

```bash
# Trigger dependency scan
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/dependency-scanner" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source":"custom_ci","commit":"COMMIT_SHA"}'

# Trigger vulnerability scan
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/vulnerability-scanner" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scan_type":"full","source":"custom_ci"}'

# Generate report
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/generate-security-report" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"report_type":"full"}'
```

## Monitoring & Alerts

### View Scan Results

1. Visit `/security-compliance` in your app
2. Check "Scan History" tab for all CI/CD runs
3. Review vulnerability details and remediation steps

### Configure Alerts

- Critical vulnerabilities auto-create notifications
- Failed scans trigger email alerts (configure in Alert Policies)
- Slack/Teams webhooks supported (coming soon)

## Best Practices

✅ **Run on every commit** - Catch issues early
✅ **Block merges on critical findings** - Enforce security standards
✅ **Review scan results regularly** - Stay on top of vulnerabilities
✅ **Update dependencies promptly** - Apply security patches
✅ **Schedule daily scans** - Catch newly disclosed CVEs
✅ **Generate reports weekly** - Track security posture over time

## Troubleshooting

### Scan Fails: "Unauthorized"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure key is not expired
- Check RLS policies allow service role access

### Scan Fails: "Network Error"
- Verify `SUPABASE_URL` is correct
- Check edge functions are deployed
- Ensure firewall allows outbound HTTPS

### No Results Showing
- Check scan completed successfully in CI logs
- Verify organization_id matches
- Review edge function logs for errors

## Security Considerations

⚠️ **NEVER** commit secrets to repository
⚠️ **ALWAYS** use service role key for CI/CD (not anon key)
⚠️ **ENABLE** branch protection to enforce scans
⚠️ **ROTATE** service role key quarterly
⚠️ **AUDIT** CI/CD access logs regularly

## Support

For issues or questions:
- Check logs in Security Center → Scan History
- Review edge function logs in Lovable Cloud
- Contact security team via `/contact`

---

**Version:** 1.0  
**Last Updated:** 2025-11-10
