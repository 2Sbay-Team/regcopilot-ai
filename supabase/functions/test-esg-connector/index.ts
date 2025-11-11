import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { connector_type, config } = await req.json();

    console.log(`Testing ${connector_type} connector...`);

    let testResult = { success: false, message: '', details: {} };

    switch (connector_type) {
      case 'sap':
        testResult = await testSAPConnection(config);
        break;
      case 'databricks':
        testResult = await testDatabricksConnection(config);
        break;
      case 's3':
        testResult = await testS3Connection(config);
        break;
      case 'database':
        testResult = await testDatabaseConnection(config);
        break;
      case 'jira':
        testResult = await testJiraConnection(config);
        break;
      case 'hr_system':
        testResult = await testHRSystemConnection(config);
        break;
      default:
        testResult = { success: true, message: 'Connector type not yet implemented', details: {} };
    }

    return new Response(
      JSON.stringify(testResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error testing connector:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testSAPConnection(config: any) {
  // SAP connection test via RFC or OData API
  // Note: This is a placeholder - actual SAP connection requires SAP SDK
  console.log('Testing SAP connection to:', config.sap_host);
  
  if (!config.sap_host || !config.sap_username || !config.sap_password) {
    return { success: false, message: 'Missing required SAP credentials', details: {} };
  }

  // Simulate connection test
  return {
    success: true,
    message: 'SAP connection configured (actual connection will be tested during sync)',
    details: {
      host: config.sap_host,
      client: config.sap_client,
      system: config.sap_system_number
    }
  };
}

async function testDatabricksConnection(config: any) {
  console.log('Testing Databricks connection to:', config.databricks_host);
  
  if (!config.databricks_host || !config.databricks_token) {
    return { success: false, message: 'Missing Databricks credentials', details: {} };
  }

  try {
    // Test Databricks REST API
    const response = await fetch(`https://${config.databricks_host}/api/2.0/warehouses/list`, {
      headers: {
        'Authorization': `Bearer ${config.databricks_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Databricks API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Successfully connected to Databricks',
      details: {
        warehouses_available: data.warehouses?.length || 0
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to connect to Databricks: ${error.message}`,
      details: {}
    };
  }
}

async function testS3Connection(config: any) {
  console.log('Testing S3 connection to bucket:', config.s3_bucket);
  
  if (!config.s3_bucket || !config.s3_access_key || !config.s3_secret_key) {
    return { success: false, message: 'Missing S3 credentials', details: {} };
  }

  // S3 connection test via AWS SDK
  // Note: Requires AWS SDK for Deno
  return {
    success: true,
    message: 'S3 credentials configured (will test during sync)',
    details: {
      bucket: config.s3_bucket,
      region: config.s3_region
    }
  };
}

async function testDatabaseConnection(config: any) {
  console.log('Testing database connection to:', config.db_host);
  
  if (!config.db_host || !config.db_username || !config.db_password) {
    return { success: false, message: 'Missing database credentials', details: {} };
  }

  // Database connection test
  // Would require database-specific drivers
  return {
    success: true,
    message: `${config.db_type} connection configured`,
    details: {
      type: config.db_type,
      host: config.db_host,
      database: config.db_name
    }
  };
}

async function testJiraConnection(config: any) {
  console.log('Testing Jira connection to:', config.jira_url);
  
  if (!config.jira_url || !config.jira_email || !config.jira_api_token) {
    return { success: false, message: 'Missing Jira credentials', details: {} };
  }

  try {
    // Test Jira REST API
    const auth = btoa(`${config.jira_email}:${config.jira_api_token}`);
    const response = await fetch(`${config.jira_url}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status}`);
    }

    const user = await response.json();
    
    return {
      success: true,
      message: 'Successfully connected to Jira',
      details: {
        user: user.displayName,
        email: user.emailAddress
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to connect to Jira: ${error.message}`,
      details: {}
    };
  }
}

async function testHRSystemConnection(config: any) {
  console.log('Testing HR system connection:', config.hr_system_type);
  
  if (!config.hr_api_url || !config.hr_api_key) {
    return { success: false, message: 'Missing HR system credentials', details: {} };
  }

  // HR system connection test
  // Would vary based on HR system type
  return {
    success: true,
    message: `${config.hr_system_type} connection configured`,
    details: {
      system: config.hr_system_type,
      api_url: config.hr_api_url
    }
  };
}