import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Agent Runner] Starting agent task processing');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending tasks, ordered by priority (1 = highest) and scheduled time
    const { data: tasks, error: fetchError } = await supabase
      .from('agent_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('scheduled_for', { ascending: true })
      .limit(5); // Process up to 5 tasks per run

    if (fetchError) {
      console.error('[Agent Runner] Error fetching tasks:', fetchError);
      throw fetchError;
    }

    if (!tasks || tasks.length === 0) {
      console.log('[Agent Runner] No pending tasks found');
      return new Response(
        JSON.stringify({ message: 'No pending tasks', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Agent Runner] Found ${tasks.length} pending tasks`);
    const results = [];

    for (const task of tasks) {
      console.log(`[Agent Runner] Processing task ${task.id}, type: ${task.task_type}`);
      
      // Mark task as in_progress
      await supabase
        .from('agent_queue')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', task.id);

      try {
        let result;

        // Route to appropriate copilot based on task type
        switch (task.task_type) {
          case 'ai_act_audit':
            result = await executeAIActAudit(task, supabase);
            break;
          case 'gdpr_scan':
            result = await executeGDPRScan(task, supabase);
            break;
          case 'esg_analysis':
            result = await executeESGAnalysis(task, supabase);
            break;
          case 'nis2_assessment':
            result = await executeNIS2Assessment(task, supabase);
            break;
          case 'dora_assessment':
            result = await executeDORAAssessment(task, supabase);
            break;
          case 'dma_assessment':
            result = await executeDMAAssessment(task, supabase);
            break;
          default:
            throw new Error(`Unknown task type: ${task.task_type}`);
        }

        // Mark task as completed
        await supabase
          .from('agent_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: result
          })
          .eq('id', task.id);

        console.log(`[Agent Runner] Task ${task.id} completed successfully`);
        results.push({ task_id: task.id, status: 'completed' });

      } catch (error) {
        console.error(`[Agent Runner] Task ${task.id} failed:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Increment retry count
        const newRetryCount = task.retry_count + 1;
        
        if (newRetryCount >= task.max_retries) {
          // Max retries reached, mark as failed
          await supabase
            .from('agent_queue')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: errorMessage,
              retry_count: newRetryCount
            })
            .eq('id', task.id);
          
          console.log(`[Agent Runner] Task ${task.id} failed permanently after ${newRetryCount} retries`);
          results.push({ task_id: task.id, status: 'failed', error: errorMessage });
        } else {
          // Reschedule for retry
          const retryDelay = Math.pow(2, newRetryCount) * 5; // Exponential backoff: 5, 10, 20 minutes
          const scheduledFor = new Date(Date.now() + retryDelay * 60 * 1000);
          
          await supabase
            .from('agent_queue')
            .update({
              status: 'pending',
              started_at: null,
              error_message: errorMessage,
              retry_count: newRetryCount,
              scheduled_for: scheduledFor.toISOString()
            })
            .eq('id', task.id);
          
          console.log(`[Agent Runner] Task ${task.id} rescheduled for retry ${newRetryCount} in ${retryDelay} minutes`);
          results.push({ task_id: task.id, status: 'retry_scheduled', retry_count: newRetryCount });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Agent run completed',
        processed: tasks.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Agent Runner] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Task execution functions for each copilot type

async function executeAIActAudit(task: any, supabase: any) {
  console.log('[Agent Runner] Executing AI Act Audit:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('ai-act-auditor', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}

async function executeGDPRScan(task: any, supabase: any) {
  console.log('[Agent Runner] Executing GDPR Scan:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('gdpr-checker', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}

async function executeESGAnalysis(task: any, supabase: any) {
  console.log('[Agent Runner] Executing ESG Analysis:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('esg-reporter', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}

async function executeNIS2Assessment(task: any, supabase: any) {
  console.log('[Agent Runner] Executing NIS2 Assessment:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('nis2-assessor', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}

async function executeDORAAssessment(task: any, supabase: any) {
  console.log('[Agent Runner] Executing DORA Assessment:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('dora-assessor', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}

async function executeDMAAssessment(task: any, supabase: any) {
  console.log('[Agent Runner] Executing DMA Assessment:', task.payload);
  
  const { data, error } = await supabase.functions.invoke('dma-assessor', {
    body: task.payload
  });

  if (error) throw error;
  return data;
}