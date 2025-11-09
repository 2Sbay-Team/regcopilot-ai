# Enterprise Data Connectors

## Overview

The Compliance & ESG Copilot now supports enterprise data connectors that automatically sync data from external systems for compliance monitoring. This enables automated compliance checks upon data ingestion from enterprise tools like SAP, SharePoint, AWS S3, and more.

## Supported Connectors

### Cloud Storage
- **AWS S3** - Sync documents and files from S3 buckets
- **Azure Blob Storage** - Connect to Azure storage containers

### Document Management
- **SharePoint** - Sync documents from SharePoint document libraries
- **OneDrive** - Monitor OneDrive folders for compliance documents

### Enterprise Systems
- **SAP / ERP** - Pull ESG and sustainability data from SAP systems
- **Jira** - Track compliance-related issues and projects

### Communication Platforms
- **Slack** - Monitor compliance discussions in Slack channels
- **Microsoft Teams** - Sync messages from Teams channels

### Data Feeds
- **RSS Feeds** - Monitor regulatory updates and news feeds

## Architecture

### Core Components

1. **Connectors Table** - Configuration and metadata for each connector
2. **Data Sources** - Tracks individual files/records from connectors
3. **Sync Logs** - Audit trail of all sync operations
4. **Agent Integration** - Automatic queuing of compliance tasks

### Data Flow

```
External System → Connector Sync → Data Source Record → Agent Queue → Compliance Analysis
```

1. **Connector Sync**: Edge function fetches data from external system
2. **Data Source Creation**: Creates record with metadata and storage path
3. **Auto-Queue Trigger**: Automatically queues appropriate analysis task
4. **Agent Processing**: Agent runner picks up task and analyzes data
5. **Results Storage**: Compliance results stored in assessment tables

## Configuration

### AWS S3 Connector

**Required Configuration:**
```json
{
  "bucket": "my-compliance-bucket",
  "region": "us-east-1"
}
```

**Required Environment Variables:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Azure Blob Storage

**Required Configuration:**
```json
{
  "storage_account": "myaccount",
  "container": "compliance-documents"
}
```

**Required Environment Variables:**
- `AZURE_SAS_TOKEN_{connector_id}` - SAS token for the container

### SharePoint

**Required Configuration:**
```json
{
  "site_url": "https://company.sharepoint.com/sites/compliance",
  "library": "Documents"
}
```

**Required Environment Variables:**
- `SHAREPOINT_TOKEN_{connector_id}` - OAuth access token

### OneDrive

**Required Configuration:**
```json
{
  "folder_path": "/Compliance Documents"
}
```

**Required Environment Variables:**
- `ONEDRIVE_TOKEN_{connector_id}` - OAuth access token

### SAP / ERP

**Required Configuration:**
```json
{
  "api_url": "https://sap.company.com:8000",
  "system_id": "PRD"
}
```

**Required Environment Variables:**
- `SAP_USERNAME_{connector_id}` - SAP username
- `SAP_PASSWORD_{connector_id}` - SAP password

### Jira

**Required Configuration:**
```json
{
  "jira_url": "https://company.atlassian.net",
  "project_key": "COMP",
  "email": "user@company.com"
}
```

**Required Environment Variables:**
- `JIRA_API_TOKEN_{connector_id}` - Jira API token

### Slack

**Required Configuration:**
```json
{
  "channel_id": "C1234567890"
}
```

**Required Environment Variables:**
- `SLACK_TOKEN_{connector_id}` - Slack bot token

### Microsoft Teams

**Required Configuration:**
```json
{
  "team_id": "team-id-here",
  "channel_id": "channel-id-here"
}
```

**Required Environment Variables:**
- `TEAMS_TOKEN_{connector_id}` - Microsoft Graph API token

### RSS Feed

**Required Configuration:**
```json
{
  "feed_url": "https://example.com/regulatory-updates.xml"
}
```

No environment variables required.

## Automatic Task Queuing

When data is synced from connectors, the system automatically queues appropriate compliance tasks:

### Trigger Rules

```sql
-- GDPR Scan triggers:
- PDF or document content types
- Files from SharePoint/OneDrive
- Priority: Medium (4)

-- AI Act Audit triggers:
- Issues from Jira
- Priority: Medium (4)

-- Default fallback:
- GDPR Scan
- Priority: Medium (4)
```

### Task Payload

Automatically queued tasks include:
```json
{
  "data_source_id": "uuid",
  "file_path": "storage-path",
  "source_name": "document.pdf",
  "connector_type": "sharepoint",
  "trigger": "connector_sync"
}
```

## Sync Frequency Options

- **Realtime** - Sync as soon as changes are detected (requires webhooks)
- **Hourly** - Sync every hour
- **Daily** - Sync once per day
- **Weekly** - Sync once per week
- **Manual** - Only sync when manually triggered

## API Usage

### Create Connector

```typescript
const { data, error } = await supabase
  .from('connectors')
  .insert({
    organization_id: 'org-uuid',
    connector_type: 'aws_s3',
    name: 'Production S3 Bucket',
    description: 'Compliance documents from production',
    sync_frequency: 'daily',
    config: {
      bucket: 'my-bucket',
      region: 'us-east-1'
    }
  });
```

### Trigger Manual Sync

```typescript
const { error } = await supabase.functions.invoke('connector-sync', {
  body: { connector_id: 'connector-uuid' }
});
```

### Query Synced Data

```typescript
const { data: sources } = await supabase
  .from('data_sources')
  .select('*')
  .eq('connector_id', 'connector-uuid')
  .order('synced_at', { ascending: false });
```

### View Sync History

```typescript
const { data: logs } = await supabase
  .from('connector_sync_logs')
  .select('*')
  .eq('connector_id', 'connector-uuid')
  .order('started_at', { ascending: false });
```

## Storage

### Synced Files Bucket

Files synced from connectors are stored in the `connector-synced-files` bucket:

**Structure:**
```
connector-synced-files/
  ├── {organization_id}/
  │   ├── {connector_id}/
  │   │   ├── {source_id}_document.pdf
  │   │   └── {source_id}_report.xlsx
```

**Access:**
- Users can only access files from their organization
- Service role has full access for sync operations

## Monitoring & Metrics

### Connector Status

- **Active** - Connector is functioning normally
- **Inactive** - Connector is disabled
- **Error** - Last sync failed
- **Configuring** - Connector is being set up

### Sync Metrics

Each connector tracks:
- **Records Processed** - Total items synced
- **Records Created** - New items added
- **Records Updated** - Existing items updated
- **Records Failed** - Items that failed to sync
- **Total Size** - Size of synced data
- **File Types** - Distribution of file types

### Dashboard View

Access the Connectors dashboard at `/connectors` to:
- View all configured connectors
- Monitor sync status and history
- Trigger manual syncs
- Create new connectors
- View sync statistics

## Security

### Authentication

- Connector credentials stored as environment variables
- Never stored in database or config JSON
- Accessed only by service role during sync

### Row-Level Security

- Users can only view/create connectors for their organization
- Only admins can manage connectors
- Service role has full access for sync operations

### Data Isolation

- Each organization's synced files stored in separate folders
- RLS policies prevent cross-organization access
- Audit trail of all sync operations

## Error Handling

### Sync Failures

When a sync fails:
1. Error logged in `connector_sync_logs`
2. Connector status updated to `error`
3. Last error message stored in connector record

### Retry Logic

Failed syncs should be manually retried:
- Review error message in sync logs
- Fix configuration or credentials
- Trigger manual sync

## Cost Tracking

### Model Usage

All AI analysis triggered by connectors is tracked in `model_usage_logs`:
- Model name and provider
- Token counts (prompt + completion)
- Cost estimates
- Associated with organization

### Storage Costs

Monitor storage usage:
```sql
SELECT 
  bucket_id,
  SUM(file_size) as total_size,
  COUNT(*) as file_count
FROM data_sources
WHERE organization_id = 'org-uuid'
GROUP BY bucket_id;
```

## Integration with Agent System

### Automatic Processing

When connector syncs data:
1. Data source record created
2. Trigger function queues appropriate task
3. Agent runner picks up task (every 15 min)
4. Copilot analyzes data
5. Results stored in assessment tables

### Task Types

Connectors can trigger any agent task type:
- `gdpr_scan` - Privacy compliance
- `esg_analysis` - Sustainability metrics
- `ai_act_audit` - AI system audits
- `nis2_assessment` - Cybersecurity
- `dora_assessment` - Financial resilience
- `dma_assessment` - Digital markets

## Best Practices

### Connector Configuration

1. **Use descriptive names** - Clearly identify source system
2. **Set appropriate sync frequency** - Balance freshness vs. API costs
3. **Monitor sync logs** - Regularly check for failures
4. **Secure credentials** - Use environment variables, not config JSON

### Data Management

1. **Filter at source** - Only sync compliance-relevant data
2. **Set retention policies** - Remove old synced data
3. **Monitor storage usage** - Track file sizes and counts
4. **Review auto-queued tasks** - Ensure appropriate task types

### Performance

1. **Batch processing** - Sync larger datasets less frequently
2. **Incremental syncs** - Use checksums to detect changes
3. **Rate limiting** - Respect external API limits
4. **Async processing** - Don't block sync on analysis

## Troubleshooting

### Common Issues

**Connector shows "error" status**
- Check environment variables are set correctly
- Verify credentials haven't expired
- Review error message in last_error field
- Check sync logs for detailed error

**No data being synced**
- Verify connector config is correct
- Check API permissions and access
- Review source system for available data
- Ensure sync frequency is appropriate

**Tasks not being auto-queued**
- Verify trigger function is enabled
- Check data_sources table has storage_path
- Review agent_queue for queued tasks
- Ensure agent runner is executing

**High storage costs**
- Review total size in data_sources
- Implement retention policies
- Filter synced data at source
- Archive old files to cheaper storage

### Debugging

Enable detailed logging in connector-sync function:
```typescript
console.log('[Connector] Processing:', data);
```

View logs in Lovable Cloud dashboard:
1. Go to Functions
2. Select connector-sync
3. View Logs tab

## Future Enhancements

### Planned Features

1. **Real-time Sync**
   - Webhook receivers for instant syncs
   - Event-driven processing

2. **Advanced Filtering**
   - Sync only specific file types
   - Pattern-based inclusion/exclusion
   - Date range filtering

3. **Data Transformation**
   - Pre-processing before storage
   - Format conversion
   - Metadata enrichment

4. **Custom Connectors**
   - User-defined connector types
   - API configuration UI
   - Custom sync logic

5. **Sentiment Analysis**
   - LinkedIn/Glassdoor ESG sentiment
   - Social media monitoring
   - Review aggregation

## API Reference

### Connector CRUD

```typescript
// Create
POST /rest/v1/connectors
{
  "organization_id": "uuid",
  "connector_type": "aws_s3",
  "name": "string",
  "config": {...}
}

// Read
GET /rest/v1/connectors?organization_id=eq.{uuid}

// Update
PATCH /rest/v1/connectors?id=eq.{uuid}
{ "status": "active" }

// Delete
DELETE /rest/v1/connectors?id=eq.{uuid}
```

### Sync Operations

```typescript
// Trigger sync
POST /functions/v1/connector-sync
{ "connector_id": "uuid" }

// Get sync logs
GET /rest/v1/connector_sync_logs
  ?connector_id=eq.{uuid}
  &order=started_at.desc

// Get data sources
GET /rest/v1/data_sources
  ?connector_id=eq.{uuid}
  &order=synced_at.desc
```

## Support

For issues with specific connectors:
1. Check connector configuration
2. Review sync logs for errors
3. Verify credentials and permissions
4. Test manual sync to reproduce issue
5. Contact support with connector ID and error logs
