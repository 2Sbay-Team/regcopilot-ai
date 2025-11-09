import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Monitoring Agent - Collects system metrics every 5 minutes
 * 
 * Metrics Collected:
 * - CPU usage (system-wide)
 * - Memory usage (process)
 * - API latency (from audit_logs)
 * - Error rate (failed requests)
 * - Storage utilization (Supabase Storage)
 * - Active users (recent auth activity)
 * 
 * Checks alert policies and triggers notifications if thresholds exceeded
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('[Monitoring Agent] Starting metrics collection...');

    // Get all organizations to collect metrics per org
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name');

    if (orgError) {
      console.error('[Monitoring Agent] Error fetching organizations:', orgError);
      throw orgError;
    }

    const metricsCollected = [];

    for (const org of organizations || []) {
      try {
        console.log(`[Monitoring Agent] Collecting metrics for org: ${org.name}`);

        // 1. CPU and Memory Usage (system-wide)
        const cpuUsage = await getCPUUsage();
        const memoryUsage = await getMemoryUsage();

        // 2. API Latency (from recent audit_logs)
        const apiLatency = await getAPILatency(supabase, org.id);

        // 3. Error Rate (from recent audit_logs)
        const errorRate = await getErrorRate(supabase, org.id);

        // 4. Storage Utilization
        const storageUtilization = await getStorageUtilization(supabase, org.id);

        // 5. Active Users (last 15 minutes)
        const activeUsers = await getActiveUsers(supabase, org.id);

        // Insert metrics
        const metrics = {
          organization_id: org.id,
          timestamp: new Date().toISOString(),
          cpu_usage: cpuUsage,
          memory_usage: memoryUsage,
          api_latency_ms: apiLatency,
          error_rate: errorRate,
          storage_utilization_gb: storageUtilization,
          active_users: activeUsers,
          metadata: {
            collection_time: new Date().toISOString(),
            agent_version: '1.0.0'
          }
        };

        const { error: insertError } = await supabase
          .from('system_metrics')
          .insert(metrics);

        if (insertError) {
          console.error(`[Monitoring Agent] Error inserting metrics for ${org.name}:`, insertError);
          continue;
        }

        metricsCollected.push({
          organization: org.name,
          metrics: metrics
        });

        // Check alert policies for this organization
        await checkAlertPolicies(supabase, org.id, metrics);

      } catch (error) {
        console.error(`[Monitoring Agent] Error collecting metrics for ${org.name}:`, error);
        continue;
      }
    }

    console.log(`[Monitoring Agent] Completed. Collected ${metricsCollected.length} metric snapshots.`);

    return new Response(
      JSON.stringify({
        success: true,
        metrics_collected: metricsCollected.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Monitoring Agent] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getCPUUsage(): Promise<number> {
  try {
    // Deno doesn't have direct CPU usage API, so we estimate based on system load
    // In production, this would integrate with system monitoring tools
    const loadAvg = Deno.loadavg();
    // Return 1-minute load average as percentage (normalized)
    return Math.min(loadAvg[0] * 10, 100);
  } catch (error) {
    console.warn('[Monitoring Agent] Could not get CPU usage:', error);
    return 0;
  }
}

async function getMemoryUsage(): Promise<number> {
  try {
    const memoryUsage = Deno.memoryUsage();
    const usedMB = memoryUsage.heapUsed / (1024 * 1024);
    const totalMB = memoryUsage.heapTotal / (1024 * 1024);
    return Math.round((usedMB / totalMB) * 100);
  } catch (error) {
    console.warn('[Monitoring Agent] Could not get memory usage:', error);
    return 0;
  }
}

async function getAPILatency(supabase: any, orgId: string): Promise<number> {
  try {
    // Query last 100 audit logs to calculate average response time
    const { data, error } = await supabase
      .from('audit_logs')
      .select('timestamp, response_summary')
      .eq('organization_id', orgId)
      .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return 0;
    }

    // Calculate average latency from response_summary if available
    const latencies = data
      .map((log: any) => log.response_summary?.latency_ms)
      .filter((l: any) => typeof l === 'number') as number[];

    if (latencies.length === 0) return 0;

    const avgLatency = latencies.reduce((sum: number, l: number) => sum + l, 0) / latencies.length;
    return Math.round(avgLatency);
  } catch (error) {
    console.warn('[Monitoring Agent] Could not calculate API latency:', error);
    return 0;
  }
}

async function getErrorRate(supabase: any, orgId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('status')
      .eq('organization_id', orgId)
      .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .limit(1000);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const failedCount = data.filter((log: any) => log.status === 'failed').length;
    const errorRate = (failedCount / data.length) * 100;
    return parseFloat(errorRate.toFixed(2));
  } catch (error) {
    console.warn('[Monitoring Agent] Could not calculate error rate:', error);
    return 0;
  }
}

async function getStorageUtilization(supabase: any, orgId: string): Promise<number> {
  try {
    // Query storage buckets for organization's files
    const buckets = [
      'gdpr-documents',
      'esg-documents',
      'ai-act-documents',
      'connector-synced-files',
      'regulatory-documents'
    ];

    let totalSize = 0;

    for (const bucket of buckets) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(orgId);

      if (!error && data) {
        totalSize += data.reduce((sum: number, file: any) => sum + (file.metadata?.size || 0), 0);
      }
    }

    // Convert to GB
    const sizeGB = totalSize / (1024 * 1024 * 1024);
    return parseFloat(sizeGB.toFixed(2));
  } catch (error) {
    console.warn('[Monitoring Agent] Could not calculate storage utilization:', error);
    return 0;
  }
}

async function getActiveUsers(supabase: any, orgId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('auth_audit_logs')
      .select('user_id')
      .eq('event_type', 'login')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    if (error || !data) {
      return 0;
    }

    // Count unique users
    const uniqueUsers = new Set(data.map((log: any) => log.user_id)).size;
    return uniqueUsers;
  } catch (error) {
    console.warn('[Monitoring Agent] Could not count active users:', error);
    return 0;
  }
}

async function checkAlertPolicies(supabase: any, orgId: string, metrics: any) {
  try {
    const { data: policies, error } = await supabase
      .from('alert_policies')
      .select('*')
      .eq('organization_id', orgId)
      .eq('enabled', true);

    if (error || !policies || policies.length === 0) {
      return;
    }

    for (const policy of policies) {
      // Check cooldown period
      if (policy.last_triggered_at) {
        const lastTriggered = new Date(policy.last_triggered_at);
        const cooldownEnd = new Date(lastTriggered.getTime() + policy.cooldown_minutes * 60 * 1000);
        if (new Date() < cooldownEnd) {
          continue; // Still in cooldown
        }
      }

      // Get metric value
      let metricValue: number | null = null;
      switch (policy.metric_type) {
        case 'cpu_usage':
          metricValue = metrics.cpu_usage;
          break;
        case 'memory_usage':
          metricValue = metrics.memory_usage;
          break;
        case 'api_latency_ms':
          metricValue = metrics.api_latency_ms;
          break;
        case 'error_rate':
          metricValue = metrics.error_rate;
          break;
        case 'storage_utilization_gb':
          metricValue = metrics.storage_utilization_gb;
          break;
        default:
          continue;
      }

      if (metricValue === null) continue;

      // Check threshold
      const thresholdExceeded = evaluateThreshold(
        metricValue,
        policy.threshold_value,
        policy.comparison_operator
      );

      if (thresholdExceeded) {
        console.log(`[Monitoring Agent] Alert triggered: ${policy.policy_name} for org ${orgId}`);

        // Create alert notification
        await supabase.from('security_alert_notifications').insert({
          organization_id: orgId,
          policy_id: policy.id,
          alert_type: policy.metric_type,
          severity: policy.severity,
          message: `Alert: ${policy.policy_name} - ${policy.metric_type} is ${metricValue} (threshold: ${policy.threshold_value})`,
          metric_value: metricValue,
          threshold_value: policy.threshold_value,
          event_data: { metrics },
          sent_channels: policy.notification_channels
        });

        // Update policy last_triggered_at
        await supabase
          .from('alert_policies')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', policy.id);

        // TODO: Send actual notifications (email, Slack, webhook)
        // For now, just log
        console.log(`[Monitoring Agent] Alert notification created for policy: ${policy.policy_name}`);
      }
    }
  } catch (error) {
    console.error('[Monitoring Agent] Error checking alert policies:', error);
  }
}

function evaluateThreshold(value: number, threshold: number, operator: string): boolean {
  switch (operator) {
    case 'gt':
      return value > threshold;
    case 'lt':
      return value < threshold;
    case 'eq':
      return value === threshold;
    case 'gte':
      return value >= threshold;
    case 'lte':
      return value <= threshold;
    default:
      return false;
  }
}
