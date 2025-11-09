import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

interface EvidenceCollectionRequest {
  organization_id: string;
  ai_system_id?: string;
  module_types?: string[]; // ['ai_act', 'gdpr', 'esg']
  date_from?: string;
  date_to?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: EvidenceCollectionRequest = await req.json();
    const { organization_id, ai_system_id, module_types = ['ai_act', 'gdpr', 'esg'], date_from, date_to } = body;

    // Verify user has access to organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id !== organization_id) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const evidence: any = {
      organization_id,
      ai_system_id,
      collection_timestamp: new Date().toISOString(),
      modules: {},
      audit_logs: [],
      hash_chain_verified: false,
    };

    // Collect audit logs
    let auditQuery = supabase
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organization_id)
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (date_from) auditQuery = auditQuery.gte('timestamp', date_from);
    if (date_to) auditQuery = auditQuery.lte('timestamp', date_to);

    const { data: auditLogs } = await auditQuery;
    evidence.audit_logs = auditLogs || [];
    evidence.audit_log_count = evidence.audit_logs.length;

    // Verify hash chain integrity
    let hashChainValid = true;
    for (let i = 1; i < evidence.audit_logs.length; i++) {
      const current = evidence.audit_logs[i];
      const previous = evidence.audit_logs[i - 1];
      if (current.prev_hash && current.prev_hash !== previous.output_hash) {
        hashChainValid = false;
        break;
      }
    }
    evidence.hash_chain_verified = hashChainValid;

    // Collect AI Act evidence
    if (module_types.includes('ai_act')) {
      const { data: aiSystems } = await supabase
        .from('ai_systems')
        .select('*')
        .eq('organization_id', organization_id);

      const { data: aiAssessments } = await supabase
        .from('ai_act_assessments')
        .select(`
          *,
          ai_systems (name, risk_category, purpose)
        `)
        .in('ai_system_id', (aiSystems || []).map((s: any) => s.id));

      const { data: aiModels } = await supabase
        .from('ai_models')
        .select('*')
        .eq('organization_id', organization_id);

      evidence.modules.ai_act = {
        systems_count: aiSystems?.length || 0,
        assessments_count: aiAssessments?.length || 0,
        models_count: aiModels?.length || 0,
        systems: aiSystems || [],
        assessments: aiAssessments || [],
        models: aiModels || [],
      };
    }

    // Collect GDPR evidence
    if (module_types.includes('gdpr')) {
      const { data: gdprAssessments } = await supabase
        .from('gdpr_assessments')
        .select('*')
        .eq('organization_id', organization_id);

      const { data: dsarRequests } = await supabase
        .from('dsar_requests')
        .select('*')
        .eq('organization_id', organization_id);

      const { data: dataProcessingActivities } = await supabase
        .from('data_processing_activities')
        .select('*')
        .eq('organization_id', organization_id);

      evidence.modules.gdpr = {
        assessments_count: gdprAssessments?.length || 0,
        dsar_count: dsarRequests?.length || 0,
        dpa_count: dataProcessingActivities?.length || 0,
        assessments: gdprAssessments || [],
        dsar_requests: dsarRequests || [],
        data_processing_activities: dataProcessingActivities || [],
      };
    }

    // Collect ESG evidence
    if (module_types.includes('esg')) {
      const { data: esgReports } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('organization_id', organization_id);

      evidence.modules.esg = {
        reports_count: esgReports?.length || 0,
        reports: esgReports || [],
      };
    }

    // Collect data lineage
    const { data: lineageData } = await supabase
      .from('data_lineage')
      .select('*')
      .eq('organization_id', organization_id);

    evidence.data_lineage = {
      nodes_count: lineageData?.length || 0,
      nodes: lineageData || [],
    };

    // Collect risk management data
    const { data: riskRegister } = await supabase
      .from('risk_management_register')
      .select('*')
      .eq('organization_id', organization_id);

    evidence.risk_management = {
      risks_count: riskRegister?.length || 0,
      high_risks: riskRegister?.filter((r: any) => r.risk_level === 'high').length || 0,
      risks: riskRegister || [],
    };

    // Calculate evidence coverage score
    const coverageMetrics = {
      has_audit_logs: evidence.audit_log_count > 0,
      hash_chain_valid: evidence.hash_chain_verified,
      has_ai_systems: evidence.modules.ai_act?.systems_count > 0,
      has_gdpr_assessments: evidence.modules.gdpr?.assessments_count > 0,
      has_esg_reports: evidence.modules.esg?.reports_count > 0,
      has_risk_management: evidence.risk_management.risks_count > 0,
      has_data_lineage: evidence.data_lineage.nodes_count > 0,
    };

    const coverageScore = Math.round(
      (Object.values(coverageMetrics).filter(Boolean).length / Object.keys(coverageMetrics).length) * 100
    );

    evidence.coverage_score = coverageScore;
    evidence.coverage_metrics = coverageMetrics;

    // Log evidence collection
    await supabase.from('audit_logs').insert({
      organization_id,
      agent: 'evidence-collector',
      action: 'collect_evidence',
      status: 'success',
      input_hash: crypto.randomUUID(),
      event_type: 'compliance_evidence_collection',
      request_payload: body,
      response_summary: {
        coverage_score: coverageScore,
        modules: Object.keys(evidence.modules),
        audit_log_count: evidence.audit_log_count,
      },
    });

    return new Response(JSON.stringify({ success: true, evidence }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Evidence collection error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});