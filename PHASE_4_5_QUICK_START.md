# Phase 4.4 & 5 Quick Start Guide

## What's Been Completed

### ✅ Database Infrastructure (100% Complete)
All necessary tables have been created and configured:

**Phase 4.4 - Monitoring Tables:**
- `system_metrics` - CPU, memory, API latency, error rates
- `security_events` - Auth failures, RLS violations, prompt injection
- `alert_policies` - Configurable alert thresholds
- `security_alert_notifications` - Alert history and acknowledgments
- `soc2_evidence_snapshots` - Automated compliance evidence

**Phase 5 - Enterprise Tables:**
- `onboarding_events` - User onboarding tracking
- `support_tickets` - Help desk system
- `demo_tenants` - Demo environment management
- Extended `organizations` table with subscription fields

All tables have:
- ✅ Proper indexes for performance
- ✅ Row-Level Security (RLS) policies
- ✅ Foreign key constraints
- ✅ Appropriate default values

### ✅ Monitoring Agent (Core Functionality)
Created `supabase/functions/monitoring-agent/index.ts` that:
- Collects system metrics every 5 minutes
- Tracks CPU, memory, API latency, error rates
- Monitors storage utilization per organization
- Checks alert policies and triggers notifications
- Logs all metrics to `system_metrics` table

---

## Next Steps for Implementation

### Priority 1: Set Up Scheduled Monitoring (Critical)

**What**: Configure the monitoring agent to run automatically every 5 minutes

**How**:
1. Enable pg_cron extension in your Supabase project
2. Use the `supabase insert` tool (NOT migration) to run:

```sql
SELECT cron.schedule(
  'monitoring-agent-5min',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1/monitoring-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{"timestamp": "' || now() || '"}'::jsonb
  ) as request_id;
  $$
);
```

**Replace `YOUR_ANON_KEY`** with your actual Supabase anon key.

---

### Priority 2: Create Alert Policies

**What**: Define thresholds that trigger notifications

**Example SQL** (insert via `supabase insert` tool):

```sql
-- High CPU usage alert
INSERT INTO public.alert_policies (
  organization_id,
  policy_name,
  metric_type,
  threshold_value,
  comparison_operator,
  severity,
  notification_channels,
  contact_email,
  enabled
) VALUES (
  'YOUR_ORG_ID',
  'High CPU Usage',
  'cpu_usage',
  80,
  'gt',
  'high',
  ARRAY['email'],
  'admin@yourcompany.com',
  true
);

-- High API latency alert
INSERT INTO public.alert_policies (
  organization_id,
  policy_name,
  metric_type,
  threshold_value,
  comparison_operator,
  severity,
  notification_channels,
  contact_email,
  enabled
) VALUES (
  'YOUR_ORG_ID',
  'High API Latency',
  'api_latency_ms',
  500,
  'gt',
  'medium',
  ARRAY['email'],
  'admin@yourcompany.com',
  true
);

-- High error rate alert
INSERT INTO public.alert_policies (
  organization_id,
  policy_name,
  metric_type,
  threshold_value,
  comparison_operator,
  severity,
  notification_channels,
  contact_email,
  enabled
) VALUES (
  'YOUR_ORG_ID',
  'High Error Rate',
  'error_rate',
  5,
  'gt',
  'critical',
  ARRAY['email'],
  'admin@yourcompany.com',
  true
);
```

---

### Priority 3: Test the Monitoring System

**Steps**:
1. Manually invoke the monitoring agent:
   ```bash
   curl -X POST https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1/monitoring-agent \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

2. Check that metrics were collected:
   ```sql
   SELECT * FROM system_metrics 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

3. Verify alert policies are checking:
   ```sql
   SELECT * FROM security_alert_notifications 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

## Implementation Roadmap

### Week 1: Core Monitoring (Focus Here First)
- [x] Database migrations ✅
- [x] Monitoring agent function ✅
- [ ] Set up pg_cron scheduling
- [ ] Create default alert policies
- [ ] Test end-to-end monitoring

### Week 2: Additional Edge Functions
- [ ] `alert-engine` - Send email/Slack notifications
- [ ] `soc2-generate-evidence` - Daily compliance snapshots
- [ ] `soc2-generate-report` - 30-day PDF reports

### Week 3: Monitoring Dashboard UI
- [ ] Create `MonitoringDashboard.tsx`
- [ ] Real-time metrics display
- [ ] Alert acknowledgment interface
- [ ] Historical trend graphs

### Week 4: Enterprise Features (Phase 5)
- [ ] Enable Stripe integration
- [ ] Create onboarding wizard
- [ ] Set up demo tenants
- [ ] Build help center

---

## Testing Your Setup

### 1. Verify Database Tables Exist
```sql
-- Should return 8 new tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'system_metrics',
  'security_events',
  'alert_policies',
  'security_alert_notifications',
  'soc2_evidence_snapshots',
  'onboarding_events',
  'support_tickets',
  'demo_tenants'
);
```

### 2. Check RLS Policies
```sql
-- Should show policies for all new tables
SELECT tablename, policyname, roles 
FROM pg_policies 
WHERE tablename IN (
  'system_metrics',
  'security_events',
  'alert_policies'
);
```

### 3. Verify Monitoring Agent Function
```bash
# Should return success with metrics_collected count
curl https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1/monitoring-agent
```

---

## Key Features Ready to Use

### Monitoring (Phase 4.4)
- ✅ System metrics collection
- ✅ Alert policy engine
- ✅ Security event tracking
- ⚠️ Email/Slack notifications (needs integration)
- ⚠️ SOC 2 evidence generation (needs implementation)

### Enterprise (Phase 5)
- ✅ Database schema ready
- ⚠️ Stripe integration (needs enabling)
- ⚠️ Onboarding wizard (needs UI)
- ⚠️ Demo tenants (needs seeding)
- ⚠️ Support tickets (needs UI)

---

## Quick Wins You Can Implement Now

1. **View Metrics in Dashboard**
   - Add a simple table/chart in existing Admin page
   - Query `system_metrics` for last 24 hours
   - Display CPU, memory, API latency trends

2. **Manual Alert Testing**
   - Insert a test alert policy
   - Trigger monitoring agent manually
   - Check `security_alert_notifications` table

3. **Track Security Events**
   - Log prompt injection attempts to `security_events`
   - Add calls in existing copilot functions
   - View in Security Center dashboard

---

## Common Issues & Solutions

### Issue: Monitoring agent returns empty metrics
**Solution**: Make sure you have data in `audit_logs` table. The agent calculates metrics from recent logs.

### Issue: Alerts not triggering
**Solution**: 
1. Check alert policy `enabled` = true
2. Verify threshold values are realistic
3. Check `last_triggered_at` - may be in cooldown

### Issue: pg_cron job not running
**Solution**:
1. Verify pg_cron extension is enabled
2. Check cron job exists: `SELECT * FROM cron.job;`
3. Check execution logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`

---

## Additional Resources

- **Full Roadmap**: See `PHASE_4_5_IMPLEMENTATION_ROADMAP.md`
- **Security Audit**: See `SECURITY_PEN_TEST_REPORT.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Security Policy**: See `SECURITY.md`

---

## Support

If you encounter issues:
1. Check edge function logs in Supabase dashboard
2. Verify RLS policies are not blocking inserts
3. Check that service role key is configured correctly
4. Review the implementation roadmap for dependencies

---

**Status**: Foundation Complete ✅ - Ready for Scheduling & Testing  
**Next Action**: Set up pg_cron monitoring schedule  
**ETA to Full Monitoring**: 1-2 days  
**ETA to Full Enterprise Features**: 4-5 weeks
