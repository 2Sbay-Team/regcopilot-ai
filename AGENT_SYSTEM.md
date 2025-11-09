# Agentic Automation System

## Overview

The Compliance & ESG Copilot now features a lightweight agentic automation system that automatically processes compliance tasks in the background. This system enables automatic scanning and compliance audits when new documents or ERP data are added.

## Architecture

### Core Components

1. **Agent Queue Table** (`agent_queue`)
   - Stores pending, in-progress, and failed tasks
   - Priority-based task ordering (1 = highest, 10 = lowest)
   - Automatic retry mechanism with exponential backoff
   - Scheduled task execution support

2. **Agent Task History** (`agent_task_history`)
   - Audit trail of all completed and failed tasks
   - Execution time metrics
   - Error logging and debugging information

3. **Agent Runner** (Edge Function)
   - Processes up to 5 tasks per run
   - Automatically invokes appropriate copilot based on task type
   - Handles retries with exponential backoff (5, 10, 20 minutes)
   - Runs every 15 minutes via cron job

### Task Types

The system supports six task types:

- `ai_act_audit` - AI Act compliance auditing
- `gdpr_scan` - GDPR privacy compliance scanning
- `esg_analysis` - ESG/CSRD reporting analysis
- `nis2_assessment` - NIS2 cybersecurity assessment
- `dora_assessment` - DORA financial resilience assessment
- `dma_assessment` - Digital Markets Act assessment

## Automatic Triggers

### Document Upload Triggers

The system automatically queues tasks when documents are uploaded:

- **GDPR Documents Bucket**: Triggers `gdpr_scan` task
- **ESG Documents Bucket**: Triggers `esg_analysis` task

Files uploaded to these buckets are automatically analyzed without manual intervention.

## Manual Task Creation

You can manually create agent tasks programmatically:

```typescript
const { data, error } = await supabase
  .from('agent_queue')
  .insert({
    organization_id: 'your-org-id',
    task_type: 'gdpr_scan',
    priority: 3, // 1-10, lower = higher priority
    payload: {
      file_path: 'path/to/document.pdf',
      bucket: 'gdpr-documents'
    }
  });
```

## Monitoring & Management

### Agent Tasks Dashboard

Access the Agent Tasks dashboard at `/agents` to:

- View active task queue
- Monitor task history
- See real-time task status updates
- Manually trigger agent execution
- Cancel pending tasks
- View execution metrics

### Task Status Flow

```
pending → in_progress → completed
                    ↓
                  failed (with retries)
                    ↓
         pending (retry) or failed (max retries)
```

### Priority Levels

- **Priority 1-3**: High priority (critical compliance tasks)
- **Priority 4-6**: Medium priority (standard assessments)
- **Priority 7-10**: Low priority (background analysis)

## Scheduling

### Cron Schedule

The agent runner executes automatically every 15 minutes using PostgreSQL's `pg_cron`:

```sql
*/15 * * * *  -- Every 15 minutes
```

### Manual Execution

You can manually trigger the agent runner at any time:

```typescript
const { error } = await supabase.functions.invoke('agent-runner', {
  body: {}
});
```

Or use the "Run Agent Now" button in the Agent Tasks dashboard.

## Error Handling & Retries

### Retry Mechanism

- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential (5, 10, 20 minutes)
- **Failure Handling**: Tasks are marked as `failed` after max retries

### Error Logging

All errors are logged with:
- Error message
- Retry count
- Task payload
- Timestamp

## Security

### Row-Level Security (RLS)

All agent tables use RLS policies:
- Users can only view/create tasks for their organization
- Admins can delete tasks
- Service role has full access for agent execution

### Authentication

- Agent runner function is public (`verify_jwt = false`)
- Individual copilot functions require authentication
- Task execution uses service role for database operations

## Integration with Existing Copilots

The agent system integrates with all existing copilot edge functions:

- `ai-act-auditor`
- `gdpr-checker`
- `esg-reporter`
- `nis2-assessor`
- `dora-assessor`
- `dma-assessor`

Each copilot can be:
1. **Called manually** through the UI
2. **Called automatically** by the agent system

## Real-time Updates

The Agent Tasks dashboard uses Supabase Realtime to provide live updates:

```typescript
const channel = supabase
  .channel('agent_queue_changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'agent_queue' 
  }, () => {
    // Refresh task list
  })
  .subscribe();
```

## Future Enhancements

### Planned Features

1. **Enterprise Data Connectors**
   - SAP integration
   - SharePoint connector
   - Azure blob storage
   - AWS S3 connector
   - Databricks integration

2. **Advanced Scheduling**
   - Custom cron expressions per task type
   - Time-based task scheduling
   - Batch processing

3. **Notification System**
   - Email notifications for task completion
   - Slack/Teams integration
   - Webhook callbacks

4. **MCP Protocol Support**
   - Model Context Protocol compatibility
   - External agent orchestration
   - FastAPI migration path

## Hybrid Architecture

The system is designed to be hybrid-ready:

- **Current**: Runs entirely in Supabase Cloud
- **Future**: Can migrate agent logic to FastAPI/MCP while maintaining Supabase for data storage
- **Deployment**: Remains fully functional in Lovable Cloud today

## Troubleshooting

### Common Issues

**Tasks stuck in pending**
- Check cron job is running: `SELECT * FROM cron.job WHERE jobname = 'agent-runner-every-15min';`
- Manually trigger agent: Use "Run Agent Now" button

**Tasks failing repeatedly**
- Check error messages in task history
- Verify copilot edge functions are deployed
- Check Lovable AI credits (if using AI models)

**No automatic triggers**
- Verify storage bucket names match trigger function
- Check storage bucket policies allow reads
- Verify trigger is attached to `storage.objects` table

### Debugging

Enable detailed logging in the agent runner edge function:

```typescript
console.log('[Agent Runner] Processing task:', task);
```

View logs in the Lovable Cloud dashboard under Functions → agent-runner → Logs.

## API Reference

### Create Task

```typescript
POST /rest/v1/agent_queue
{
  "organization_id": "uuid",
  "task_type": "gdpr_scan",
  "priority": 3,
  "payload": { ... },
  "scheduled_for": "2025-11-09T12:00:00Z" // optional
}
```

### Trigger Agent

```typescript
POST /functions/v1/agent-runner
{}
```

### Query Task History

```typescript
GET /rest/v1/agent_task_history
  ?organization_id=eq.{uuid}
  &order=created_at.desc
  &limit=100
```

## Performance Metrics

Monitor these key metrics:

- **Tasks Processed**: Total tasks completed per day
- **Average Execution Time**: Time to complete tasks
- **Success Rate**: Percentage of successful completions
- **Retry Rate**: Percentage of tasks requiring retries

All metrics are available in the Agent Tasks dashboard.
