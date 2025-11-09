import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check admin role
    const { data: hasAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    })

    if (!hasAdmin) {
      throw new Error('Admin role required')
    }

    // Get organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, full_name, email')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single()

    // Fetch all compliance data for Annex IV
    const [
      { data: aiSystems },
      { data: aiModels },
      { data: riskRegister },
      { data: auditLogs },
      { data: complianceScore },
      { data: dataLineage }
    ] = await Promise.all([
      supabase.from('ai_systems').select('*').eq('organization_id', profile.organization_id),
      supabase.from('ai_models').select('*').eq('organization_id', profile.organization_id),
      supabase.from('risk_management_register').select('*').eq('organization_id', profile.organization_id),
      supabase.from('audit_logs').select('*').eq('organization_id', profile.organization_id).order('timestamp', { ascending: false }).limit(100),
      supabase.from('compliance_scores').select('*').eq('organization_id', profile.organization_id).order('calculated_at', { ascending: false }).limit(1).single(),
      supabase.from('data_lineage').select('*').eq('organization_id', profile.organization_id)
    ])

    // Build Annex IV structured content
    const annexIVContent = {
      section1_general_description: {
        system_name: 'Compliance & ESG Copilot',
        version: '4.3.0',
        provider: org?.name || 'Organization',
        intended_purpose: 'B2B regulatory compliance advisory system for EU AI Act, GDPR, and CSRD/ESRS compliance',
        ai_techniques: ['Large Language Models (Gemini 2.5, GPT-5)', 'Vector embeddings (pgvector)', 'Retrieval Augmented Generation (RAG)', 'Sentiment analysis'],
        deployment_model: 'SaaS via Lovable Cloud',
        user_categories: ['Compliance Analysts', 'Legal Teams', 'ESG Officers', 'Administrators'],
        geographic_scope: 'European Union + EEA',
        risk_classification: 'Limited Risk (Article 52)',
        high_risk_justification: 'Not applicable - system provides decision support, not automated decision-making for high-risk areas'
      },
      section2_development_process: {
        development_methodology: 'Agile DevOps with continuous compliance monitoring',
        ai_models_used: aiModels || [],
        training_data_sources: 'EU regulatory documents (AI Act, GDPR, CSRD), OpenAI/Google pre-trained models',
        validation_procedures: 'Quarterly accuracy testing, human oversight mandatory',
        testing_approach: 'Unit tests, integration tests, security scans, bias assessments',
        quality_assurance: 'Code reviews, RLS policy validation, penetration testing',
        data_governance: {
          data_quality_measures: 'Input sanitization, validation schemas (Zod), data retention policies',
          bias_mitigation: 'Multi-source RAG retrieval, feedback-aware ranking, human review checkpoints',
          data_sources: ['EU Official Journal', 'ESRS Standards', 'GDPR Guidance', 'User-uploaded documents']
        }
      },
      section3_monitoring_and_control: {
        technical_monitoring: {
          audit_trail: 'SHA-256 hash chain for all AI assessments',
          logging: 'Comprehensive audit_logs table with event_category, input/output hashes',
          performance_metrics: 'Latency < 800ms P95, accuracy > 85%, user satisfaction tracking'
        },
        human_oversight: {
          roles: 'RBAC with admin, analyst, user roles',
          approval_workflows: 'Mandatory human review for all high-risk classifications',
          override_mechanisms: 'Analysts can reject/modify AI recommendations'
        },
        continuous_monitoring: {
          feedback_system: 'User feedback buttons (upvote/downvote/missing_citation)',
          anomaly_detection: 'ESG data validation, compliance drift monitoring',
          post_market_surveillance: 'DataSage continuous intelligence module'
        }
      },
      section4_risk_management: {
        risk_management_system: riskRegister || [],
        risk_assessment_methodology: 'Likelihood × Impact matrix (1-4 scale)',
        identified_risks: riskRegister?.map((r: any) => ({
          module: r.module,
          risk: r.risk_description,
          score: r.risk_score,
          mitigation: r.mitigation,
          status: r.status
        })) || [],
        mitigation_measures: [
          'RLS policies for multi-tenant data isolation',
          'Input sanitization to prevent prompt injection',
          'Rate limiting on AI API calls',
          'Backup/disaster recovery procedures',
          'Incident response plan'
        ]
      },
      section5_technical_documentation: {
        architecture: {
          frontend: 'React 18 + TypeScript + Vite',
          backend: 'Supabase (PostgreSQL + pgvector + Edge Functions)',
          ai_gateway: 'Lovable AI (Gemini 2.5, GPT-5, Mistral)',
          authentication: 'JWT + Row-Level Security + RBAC',
          encryption: 'TLS 1.3 in transit, AES-256 at rest'
        },
        data_flows: dataLineage || [],
        ai_systems_inventory: aiSystems || [],
        conformity_evidence: {
          audit_logs_sample: auditLogs?.slice(0, 10) || [],
          compliance_score: complianceScore || {}
        }
      },
      section6_transparency: {
        user_information_provided: [
          'USER_GUIDE.md with complete onboarding',
          'Explainability views for all assessments',
          'AI transparency watermarks on reports',
          'Audit trail accessible to users'
        ],
        ai_disclosure: 'All reports contain "Generated by AI" notice per Article 52(1)',
        limitations_disclosed: 'Model limitations documented in Model Registry',
        human_oversight_communicated: 'Clear indication of mandatory human review'
      },
      section7_updates_and_versions: {
        current_version: '4.3.0',
        version_history: [
          { version: '4.3.0', date: new Date().toISOString(), changes: 'EU AI Act full compliance - Annex IV, RMS, transparency' },
          { version: '4.2.0', date: '2025-01-08', changes: 'Feedback-aware RAG, analytics dashboard' },
          { version: '4.1.0', date: '2025-01-07', changes: 'Continuous Intelligence, DMA/DORA/NIS2 copilots' },
          { version: '4.0.0', date: '2025-01-06', changes: 'MVP deployment - AI Act, GDPR, ESG modules' }
        ],
        change_management: 'All model version updates logged to audit_logs with reviewer approval',
        update_procedures: 'Automated CI/CD with database migrations, backward compatibility guaranteed'
      }
    }

    // Store Annex IV document
    const { data: annexDoc, error: docError } = await supabase
      .from('annex_iv_documents')
      .insert({
        organization_id: profile.organization_id,
        document_version: '1.0',
        system_version: '4.3.0',
        responsible_person: profile.full_name || 'Administrator',
        responsible_email: profile.email || '',
        content: annexIVContent
      })
      .select()
      .single()

    if (docError) {
      console.error('Error storing Annex IV doc:', docError)
      throw new Error('Failed to store Annex IV document')
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: profile.organization_id,
      agent: 'annex_iv_generator',
      action: 'generate_documentation',
      event_type: 'compliance',
      event_category: 'eu_ai_act',
      status: 'success',
      input_hash: 'annex_iv_request',
      request_payload: {
        requested_by: user.id,
        document_version: '1.0'
      },
      response_summary: {
        document_id: annexDoc.id,
        sections_completed: 7,
        risk_classification: 'LIMITED_RISK'
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        document: annexDoc,
        content: annexIVContent,
        message: 'Annex IV Technical Documentation generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-annex-iv-report:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
