import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  connector_type: string;
  config: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connector_type, config }: ValidateRequest = await req.json();
    
    console.log('Validating connector:', connector_type);

    let validationResult = { valid: false, message: '' };

    switch (connector_type) {
      case 'aws_s3':
        validationResult = await validateAwsS3(config);
        break;
      case 'azure_blob':
        validationResult = await validateAzureBlob(config);
        break;
      case 'sharepoint':
        validationResult = await validateSharePoint(config);
        break;
      case 'onedrive':
        validationResult = await validateOneDrive(config);
        break;
      case 'sap':
        validationResult = await validateSAP(config);
        break;
      case 'jira':
        validationResult = await validateJira(config);
        break;
      case 'slack':
        validationResult = await validateSlack(config);
        break;
      case 'teams':
        validationResult = await validateTeams(config);
        break;
      case 'rss_feed':
        validationResult = await validateRssFeed(config);
        break;
      default:
        validationResult = { valid: false, message: 'Unknown connector type' };
    }

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'Validation failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function validateAwsS3(config: any) {
  const { bucket, region } = config;
  
  if (!bucket || !region) {
    return { valid: false, message: 'Bucket name and region are required' };
  }

  const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID');
  const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

  if (!awsAccessKey || !awsSecretKey) {
    return { valid: false, message: 'AWS credentials not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets.' };
  }

  try {
    // Simple validation: check if bucket name format is valid
    const bucketRegex = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/;
    if (!bucketRegex.test(bucket)) {
      return { valid: false, message: 'Invalid S3 bucket name format' };
    }

    return { valid: true, message: 'AWS S3 configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `AWS S3 validation failed: ${error.message}` };
  }
}

async function validateAzureBlob(config: any) {
  const { storage_account, container } = config;
  
  if (!storage_account || !container) {
    return { valid: false, message: 'Storage account and container name are required' };
  }

  const azureStorageKey = Deno.env.get('AZURE_STORAGE_KEY');

  if (!azureStorageKey) {
    return { valid: false, message: 'Azure credentials not configured. Please add AZURE_STORAGE_KEY secret.' };
  }

  try {
    // Validate naming conventions
    const accountRegex = /^[a-z0-9]{3,24}$/;
    const containerRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    
    if (!accountRegex.test(storage_account)) {
      return { valid: false, message: 'Invalid storage account name format' };
    }
    
    if (!containerRegex.test(container)) {
      return { valid: false, message: 'Invalid container name format' };
    }

    return { valid: true, message: 'Azure Blob Storage configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `Azure Blob validation failed: ${error.message}` };
  }
}

async function validateSharePoint(config: any) {
  const { site_url, library } = config;
  
  if (!site_url || !library) {
    return { valid: false, message: 'Site URL and document library are required' };
  }

  const msGraphToken = Deno.env.get('MS_GRAPH_TOKEN');

  if (!msGraphToken) {
    return { valid: false, message: 'Microsoft Graph credentials not configured. Please add MS_GRAPH_TOKEN secret.' };
  }

  try {
    // Validate URL format
    const url = new URL(site_url);
    if (!url.hostname.includes('sharepoint.com')) {
      return { valid: false, message: 'Invalid SharePoint URL format' };
    }

    return { valid: true, message: 'SharePoint configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `SharePoint validation failed: ${error.message}` };
  }
}

async function validateOneDrive(config: any) {
  const { folder_path } = config;
  
  if (!folder_path) {
    return { valid: false, message: 'Folder path is required' };
  }

  const msGraphToken = Deno.env.get('MS_GRAPH_TOKEN');

  if (!msGraphToken) {
    return { valid: false, message: 'Microsoft Graph credentials not configured. Please add MS_GRAPH_TOKEN secret.' };
  }

  try {
    // Validate path format
    if (!folder_path.startsWith('/')) {
      return { valid: false, message: 'Folder path must start with /' };
    }

    return { valid: true, message: 'OneDrive configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `OneDrive validation failed: ${error.message}` };
  }
}

async function validateSAP(config: any) {
  const { api_url, system_id } = config;
  
  if (!api_url || !system_id) {
    return { valid: false, message: 'API URL and System ID are required' };
  }

  const sapUsername = Deno.env.get('SAP_USERNAME');
  const sapPassword = Deno.env.get('SAP_PASSWORD');

  if (!sapUsername || !sapPassword) {
    return { valid: false, message: 'SAP credentials not configured. Please add SAP_USERNAME and SAP_PASSWORD secrets.' };
  }

  try {
    // Validate URL format
    const url = new URL(api_url);
    if (!url.protocol.startsWith('http')) {
      return { valid: false, message: 'Invalid SAP API URL format' };
    }

    return { valid: true, message: 'SAP configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `SAP validation failed: ${error.message}` };
  }
}

async function validateJira(config: any) {
  const { jira_url, project_key, email } = config;
  
  if (!jira_url || !project_key || !email) {
    return { valid: false, message: 'Jira URL, project key, and email are required' };
  }

  const jiraApiToken = Deno.env.get('JIRA_API_TOKEN');

  if (!jiraApiToken) {
    return { valid: false, message: 'Jira credentials not configured. Please add JIRA_API_TOKEN secret.' };
  }

  try {
    // Validate Jira URL
    const url = new URL(jira_url);
    if (!url.hostname.includes('atlassian.net')) {
      return { valid: false, message: 'Invalid Jira URL format. Expected *.atlassian.net domain' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Invalid email format' };
    }

    // Validate project key format (uppercase letters and numbers)
    const projectKeyRegex = /^[A-Z][A-Z0-9]+$/;
    if (!projectKeyRegex.test(project_key)) {
      return { valid: false, message: 'Invalid project key format. Should be uppercase letters/numbers' };
    }

    return { valid: true, message: 'Jira configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `Jira validation failed: ${error.message}` };
  }
}

async function validateSlack(config: any) {
  const { channel_id } = config;
  
  if (!channel_id) {
    return { valid: false, message: 'Channel ID is required' };
  }

  const slackToken = Deno.env.get('SLACK_BOT_TOKEN');

  if (!slackToken) {
    return { valid: false, message: 'Slack credentials not configured. Please add SLACK_BOT_TOKEN secret.' };
  }

  try {
    // Validate channel ID format (should start with C)
    if (!channel_id.match(/^C[A-Z0-9]{8,}$/)) {
      return { valid: false, message: 'Invalid Slack channel ID format. Should start with C followed by alphanumeric characters' };
    }

    return { valid: true, message: 'Slack configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `Slack validation failed: ${error.message}` };
  }
}

async function validateTeams(config: any) {
  const { team_id, channel_id } = config;
  
  if (!team_id || !channel_id) {
    return { valid: false, message: 'Team ID and Channel ID are required' };
  }

  const msGraphToken = Deno.env.get('MS_GRAPH_TOKEN');

  if (!msGraphToken) {
    return { valid: false, message: 'Microsoft Graph credentials not configured. Please add MS_GRAPH_TOKEN secret.' };
  }

  try {
    // Validate UUID format for team and channel IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(team_id)) {
      return { valid: false, message: 'Invalid Team ID format. Expected UUID format' };
    }
    
    if (!uuidRegex.test(channel_id)) {
      return { valid: false, message: 'Invalid Channel ID format. Expected UUID format' };
    }

    return { valid: true, message: 'Microsoft Teams configuration is valid' };
  } catch (error: any) {
    return { valid: false, message: `Teams validation failed: ${error.message}` };
  }
}

async function validateRssFeed(config: any) {
  const { feed_url } = config;
  
  if (!feed_url) {
    return { valid: false, message: 'Feed URL is required' };
  }

  try {
    // Validate URL format
    const url = new URL(feed_url);
    if (!url.protocol.startsWith('http')) {
      return { valid: false, message: 'Invalid feed URL format' };
    }

    // Try to fetch the feed to validate it exists and is accessible
    const response = await fetch(feed_url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return { valid: false, message: `Feed URL returned status ${response.status}` };
    }

    return { valid: true, message: 'RSS feed is accessible' };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { valid: false, message: 'Feed URL request timed out' };
    }
    return { valid: false, message: `RSS feed validation failed: ${error.message}` };
  }
}
