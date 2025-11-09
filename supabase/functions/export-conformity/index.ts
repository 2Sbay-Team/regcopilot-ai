import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

interface ConformityExportRequest {
  report_id: string;
  format?: 'json-ld' | 'pdf' | 'xml';
  include_evidence?: boolean;
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

    const body: ConformityExportRequest = await req.json();
    const { report_id, format = 'json-ld', include_evidence = true } = body;

    // Fetch conformity report
    const { data: report, error: reportError } = await supabase
      .from('ai_conformity_reports')
      .select(`
        *,
        organizations (name, country_code, tier, is_public_sector),
        ai_systems (name, risk_category, purpose, sector)
      `)
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user has access
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id !== report.organization_id) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch evidence links if requested
    let evidence = [];
    if (include_evidence) {
      const { data: evidenceData } = await supabase
        .from('compliance_evidence_links')
        .select('*')
        .eq('report_id', report_id);
      evidence = evidenceData || [];
    }

    // Fetch Annex IV document
    const { data: annexDoc } = await supabase
      .from('annex_iv_documents')
      .select('*')
      .eq('conformity_report_id', report_id)
      .single();

    // Fetch auditor signoffs
    const { data: signoffs } = await supabase
      .from('auditor_signoffs')
      .select(`
        *,
        profiles!auditor_id (full_name, email)
      `)
      .eq('report_id', report_id);

    // Generate JSON-LD export (compatible with EU Digital Conformity Repository)
    const jsonLD = {
      '@context': {
        '@vocab': 'https://w3id.org/eu/ai-act#',
        'dc': 'http://purl.org/dc/terms/',
        'schema': 'http://schema.org/',
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
      },
      '@type': 'AIConformityDeclaration',
      '@id': `urn:uuid:${report.id}`,
      'dc:identifier': report.id,
      'dc:created': report.generated_at,
      'dc:modified': report.updated_at,
      'schema:version': report.version.toString(),
      
      // Organization details
      'provider': {
        '@type': 'Organization',
        'schema:name': report.organizations?.name,
        'schema:location': {
          '@type': 'Place',
          'schema:addressCountry': report.organizations?.country_code,
        },
        'publicSectorEntity': report.organizations?.is_public_sector,
      },

      // AI System details
      'aiSystem': {
        '@type': 'AISystem',
        '@id': `urn:uuid:${report.ai_system_id}`,
        'schema:name': report.ai_systems?.name,
        'purpose': report.ai_systems?.purpose,
        'sector': report.ai_systems?.sector,
        'riskCategory': report.risk_category,
      },

      // Conformity Assessment
      'conformityAssessment': {
        '@type': 'ConformityAssessment',
        'reportType': report.report_type,
        'complianceStatus': report.compliance_status,
        'riskClassification': report.risk_category,
        'annexIVCompliance': report.annex_iv_items,
        'evidenceSummary': report.evidence_summary,
      },

      // Cryptographic verification
      'digitalSignature': {
        '@type': 'DigitalSignature',
        'signatureValue': report.signed_hash,
        'signatureAlgorithm': report.signature_algorithm,
        'signatureDate': report.generated_at,
      },

      // Annex IV Documentation
      'technicalDocumentation': annexDoc ? {
        '@type': 'TechnicalDocumentation',
        '@id': `urn:uuid:${annexDoc.id}`,
        'documentVersion': annexDoc.document_version,
        'sections': {
          'generalDescription': annexDoc.general_description,
          'developmentProcess': annexDoc.development_process,
          'monitoringLogging': annexDoc.monitoring_logging,
          'riskManagement': annexDoc.risk_management,
          'technicalSpecifications': annexDoc.technical_documentation,
          'transparencyInformation': annexDoc.transparency_info,
          'updatesAndMaintenance': annexDoc.updates_maintenance,
        },
        'hashSignature': annexDoc.hash_signature,
      } : null,

      // Evidence links
      'supportingEvidence': evidence.map((e: any) => ({
        '@type': 'Evidence',
        '@id': `urn:uuid:${e.id}`,
        'evidenceType': e.evidence_type,
        'evidenceCategory': e.evidence_category,
        'requirementCode': e.requirement_code,
        'verified': e.verified,
        'verificationDate': e.verified_at,
        'documentURL': e.document_url,
      })),

      // Auditor certifications
      'certifications': (signoffs || []).map((s: any) => ({
        '@type': 'Certification',
        '@id': `urn:uuid:${s.id}`,
        'auditor': {
          '@type': 'Person',
          'schema:name': s.profiles?.full_name,
          'schema:email': s.profiles?.email,
        },
        'decision': s.decision,
        'complianceScore': s.compliance_score,
        'evidenceCoverageScore': s.evidence_coverage_score,
        'certificationBody': s.certification_body,
        'certificationID': s.certification_id,
        'signatureHash': s.signed_hash,
        'signatureDate': s.signature_timestamp,
        'expiryDate': s.expiry_date,
      })),

      // Metadata
      'metadata': {
        'exportDate': new Date().toISOString(),
        'exportFormat': format,
        'schemaVersion': '1.0',
        'conformsToRegulation': 'EU AI Act (Regulation 2024/1689)',
      },
    };

    // Log export action
    await supabase.from('audit_logs').insert({
      organization_id: report.organization_id,
      agent: 'conformity-exporter',
      action: 'export_conformity_report',
      status: 'success',
      input_hash: report_id,
      event_type: 'conformity_export',
      request_payload: body,
      response_summary: {
        report_id,
        format,
        evidence_count: evidence.length,
        signoff_count: signoffs?.length || 0,
      },
    });

    // Return based on format
    if (format === 'json-ld') {
      return new Response(JSON.stringify(jsonLD, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/ld+json',
          'Content-Disposition': `attachment; filename="conformity-${report_id}.jsonld"`,
        },
      });
    }

    // For PDF and XML, return JSON-LD for now (can be extended later)
    return new Response(JSON.stringify({ success: true, data: jsonLD }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Conformity export error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});