import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';
import { sanitizeInput } from '../_shared/sanitize.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

interface ActuatorRule {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: string;
  condition_logic: RuleCondition | RuleCondition[];
  action_type: string;
  action_config: Record<string, any>;
  priority: number;
  execution_count: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User has no organization');
    }

    const body = await req.json();
    const { trigger_source, trigger_id, trigger_data, test_mode = false } = body;

    console.log(`[Actuator Engine] Processing trigger: ${trigger_source}, test_mode: ${test_mode}`);

    // Fetch enabled rules for this trigger type
    const { data: rules, error: rulesError } = await supabase
      .from('actuator_rules')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('enabled', true)
      .eq('trigger_type', trigger_source)
      .order('priority', { ascending: false });

    if (rulesError) {
      console.error('[Actuator Engine] Error fetching rules:', rulesError);
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      console.log('[Actuator Engine] No matching rules found');
      return new Response(
        JSON.stringify({ 
          message: 'No matching rules found',
          executed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const executedActions: any[] = [];

    // Evaluate each rule
    for (const rule of rules as ActuatorRule[]) {
      const startTime = Date.now();
      
      try {
        // Evaluate condition logic
        const conditionMet = evaluateCondition(rule.condition_logic, trigger_data);
        
        if (!conditionMet) {
          console.log(`[Actuator Engine] Rule "${rule.name}" condition not met`);
          continue;
        }

        console.log(`[Actuator Engine] Rule "${rule.name}" matched, executing action: ${rule.action_type}`);

        // Execute action based on type
        const actionResult = await executeAction(
          rule.action_type,
          rule.action_config,
          trigger_data,
          test_mode,
          supabase
        );

        const executionTime = Date.now() - startTime;

        // Generate action hash
        const actionPayload = {
          rule_id: rule.id,
          trigger_source,
          trigger_id,
          action_type: rule.action_type,
          action_config: rule.action_config,
          timestamp: new Date().toISOString()
        };

        const actionHash = await generateHash(JSON.stringify(actionPayload));

        // Log the action
        if (!test_mode) {
          await supabase.from('actuator_logs').insert({
            organization_id: profile.organization_id,
            rule_id: rule.id,
            trigger_source,
            trigger_id,
            action_type: rule.action_type,
            action_payload: actionPayload,
            status: actionResult.success ? 'success' : 'failed',
            result: actionResult.result,
            error_message: actionResult.error,
            execution_time_ms: executionTime,
            reasoning_summary: `Rule "${rule.name}" triggered by ${trigger_source}. Condition: ${JSON.stringify(rule.condition_logic)}`,
            action_hash: actionHash
          });

          // Update rule execution stats
          await supabase
            .from('actuator_rules')
            .update({
              last_executed_at: new Date().toISOString(),
              execution_count: (rule.execution_count || 0) + 1
            })
            .eq('id', rule.id);

          // Log to audit_logs
          await supabase.from('audit_logs').insert({
            organization_id: profile.organization_id,
            actor_id: user.id,
            agent: 'actuator-engine',
            event_type: 'automation',
            event_category: 'action_executed',
            action: rule.action_type,
            status: actionResult.success ? 'success' : 'failed',
            input_hash: actionHash,
            request_payload: actionPayload,
            response_summary: actionResult.result,
            reasoning_chain: {
              rule: rule.name,
              condition: rule.condition_logic,
              trigger: trigger_source
            }
          });
        }

        executedActions.push({
          rule_name: rule.name,
          action_type: rule.action_type,
          status: actionResult.success ? 'success' : 'failed',
          execution_time_ms: executionTime,
          test_mode
        });

      } catch (error) {
        console.error(`[Actuator Engine] Error executing rule "${rule.name}":`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        executedActions.push({
          rule_name: rule.name,
          action_type: rule.action_type,
          status: 'failed',
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Actuator engine executed',
        executed: executedActions.length,
        actions: executedActions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Actuator Engine] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Evaluate condition logic
function evaluateCondition(
  condition: RuleCondition | RuleCondition[],
  data: Record<string, any>
): boolean {
  // Handle array of conditions (AND logic)
  if (Array.isArray(condition)) {
    return condition.every(c => evaluateSingleCondition(c, data));
  }
  
  return evaluateSingleCondition(condition, data);
}

function evaluateSingleCondition(condition: RuleCondition, data: Record<string, any>): boolean {
  const fieldValue = data[condition.field];
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'greater_than':
      return fieldValue > condition.value;
    case 'less_than':
      return fieldValue < condition.value;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    default:
      return false;
  }
}

// Execute action based on type
async function executeAction(
  actionType: string,
  actionConfig: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  
  console.log(`[Actuator] Executing action: ${actionType}, test_mode: ${testMode}`);

  switch (actionType) {
    case 'email':
      return await executeEmailAction(actionConfig, triggerData, testMode);
    
    case 'slack':
      return await executeSlackAction(actionConfig, triggerData, testMode);
    
    case 'jira':
      return await executeJiraAction(actionConfig, triggerData, testMode);
    
    case 'archive_file':
      return await executeArchiveFileAction(actionConfig, triggerData, testMode, supabase);
    
    case 'move_file':
      return await executeMoveFileAction(actionConfig, triggerData, testMode, supabase);
    
    case 'trigger_function':
      return await executeTriggerFunctionAction(actionConfig, triggerData, testMode, supabase);
    
    default:
      return { success: false, error: `Unknown action type: ${actionType}` };
  }
}

async function executeEmailAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] Email would be sent',
        to: config.to,
        subject: config.subject
      }
    };
  }
  
  // Placeholder: integrate with email service (SendGrid, Resend, etc.)
  console.log('[Actuator] Email action - not yet implemented in production');
  return { 
    success: true, 
    result: { message: 'Email action logged (not implemented)' }
  };
}

async function executeSlackAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] Slack message would be sent',
        webhook: config.webhook_url
      }
    };
  }
  
  // Placeholder: integrate with Slack webhook
  console.log('[Actuator] Slack action - not yet implemented in production');
  return { 
    success: true, 
    result: { message: 'Slack action logged (not implemented)' }
  };
}

async function executeJiraAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] Jira ticket would be created',
        project: config.project_key
      }
    };
  }
  
  // Placeholder: integrate with Jira API
  console.log('[Actuator] Jira action - not yet implemented in production');
  return { 
    success: true, 
    result: { message: 'Jira action logged (not implemented)' }
  };
}

async function executeArchiveFileAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] File would be archived',
        bucket: config.bucket,
        path: triggerData.file_path
      }
    };
  }
  
  // Placeholder: move file to archive bucket
  console.log('[Actuator] Archive file action - not yet implemented in production');
  return { 
    success: true, 
    result: { message: 'Archive action logged (not implemented)' }
  };
}

async function executeMoveFileAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] File would be moved',
        from: config.source_bucket,
        to: config.target_bucket
      }
    };
  }
  
  // Placeholder: move file between buckets
  console.log('[Actuator] Move file action - not yet implemented in production');
  return { 
    success: true, 
    result: { message: 'Move action logged (not implemented)' }
  };
}

async function executeTriggerFunctionAction(
  config: Record<string, any>,
  triggerData: Record<string, any>,
  testMode: boolean,
  supabase: any
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (testMode) {
    return { 
      success: true, 
      result: { 
        message: '[TEST MODE] Function would be triggered',
        function: config.function_name
      }
    };
  }
  
  try {
    const { data, error } = await supabase.functions.invoke(config.function_name, {
      body: { ...triggerData, triggered_by: 'actuator-engine' }
    });
    
    if (error) throw error;
    
    return { 
      success: true, 
      result: data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
