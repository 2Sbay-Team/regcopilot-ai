import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query all tables with RLS status
    const { data: tables, error } = await supabase.rpc('get_table_rls_status');

    if (error) {
      // Fallback: query information_schema
      const { data: schemaTables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      const validationResults = [];

      for (const table of schemaTables || []) {
        const tableName = table.table_name;
        
        // Check RLS enabled
        const { data: rlsCheck } = await supabase.rpc('check_rls_enabled', {
          table_name: tableName,
        });

        // Count policies
        const { count: policyCount } = await supabase
          .from('pg_policies')
          .select('*', { count: 'exact' })
          .eq('tablename', tableName);

        const issues: string[] = [];
        if (!rlsCheck) {
          issues.push('RLS not enabled');
        }
        if (!policyCount || policyCount === 0) {
          issues.push('No policies defined');
        }

        validationResults.push({
          table_name: tableName,
          rls_enabled: !!rlsCheck,
          policy_count: policyCount || 0,
          issues_found: issues,
        });
      }

      // Store results
      const { error: insertError } = await supabase
        .from('rls_validation_logs')
        .insert(validationResults);

      if (insertError) {
        console.error('Failed to store RLS validation:', insertError);
      }

      const criticalIssues = validationResults.filter((r) => r.issues_found.length > 0);

      return new Response(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          tables_checked: validationResults.length,
          tables_with_issues: criticalIssues.length,
          results: validationResults,
          status: criticalIssues.length === 0 ? 'pass' : 'fail',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'RLS validation not implemented' }),
      { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RLS validation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
