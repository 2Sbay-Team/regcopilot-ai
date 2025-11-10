import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    // Check if controls already exist
    const { data: existing } = await supabase
      .from('compliance_controls')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Compliance controls already seeded' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SOC 2 Type II Controls
    const soc2Controls = [
      { control_id: 'CC1.1', title: 'COSO Principles', description: 'Entity demonstrates commitment to integrity and ethical values', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC1.2', title: 'Board Independence', description: 'Board exercises oversight of strategy and risk', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC2.1', title: 'Security Objectives', description: 'Entity defines security objectives to support business', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC3.1', title: 'Risk Assessment', description: 'Entity identifies and analyzes risks to achieve objectives', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'CC4.1', title: 'Monitoring Activities', description: 'Entity monitors system through ongoing evaluations', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC5.1', title: 'Control Activities', description: 'Entity selects and develops control activities', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC6.1', title: 'Logical Access', description: 'Entity implements logical access security controls', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'CC6.2', title: 'Authentication', description: 'Prior to system access, entity identifies and authenticates users', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'CC6.3', title: 'Authorization', description: 'Entity authorizes users to access resources', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'CC6.6', title: 'Encryption', description: 'Entity implements encryption to protect data', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'CC6.7', title: 'Transmission Protection', description: 'Entity restricts transmission of data to authorized external parties', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC7.1', title: 'Change Detection', description: 'Entity identifies and manages changes to system components', category: 'Common Criteria', priority: 'high' },
      { control_id: 'CC7.2', title: 'Security Incidents', description: 'Entity responds to security incidents', category: 'Common Criteria', priority: 'critical' },
      { control_id: 'A1.1', title: 'System Availability', description: 'Entity maintains availability commitments and SLAs', category: 'Availability', priority: 'high' },
      { control_id: 'A1.2', title: 'Capacity Planning', description: 'Entity manages system capacity to meet availability objectives', category: 'Availability', priority: 'medium' },
      { control_id: 'C1.1', title: 'Data Classification', description: 'Entity classifies confidential information', category: 'Confidentiality', priority: 'high' },
      { control_id: 'C1.2', title: 'Data Disposal', description: 'Entity disposes of confidential information securely', category: 'Confidentiality', priority: 'high' },
      { control_id: 'PI1.1', title: 'Data Quality', description: 'Entity implements controls to ensure data quality', category: 'Processing Integrity', priority: 'medium' },
      { control_id: 'PI1.2', title: 'Data Completeness', description: 'Entity processes complete and accurate data', category: 'Processing Integrity', priority: 'medium' },
      { control_id: 'P1.1', title: 'Privacy Notice', description: 'Entity provides notice about privacy practices', category: 'Privacy', priority: 'critical' },
      { control_id: 'P2.1', title: 'Consent', description: 'Entity obtains consent for collection and use of personal information', category: 'Privacy', priority: 'critical' },
      { control_id: 'P3.1', title: 'Data Collection', description: 'Entity collects personal information only for disclosed purposes', category: 'Privacy', priority: 'high' },
      { control_id: 'P4.1', title: 'Data Access', description: 'Entity grants data subjects access to their personal information', category: 'Privacy', priority: 'high' },
      { control_id: 'P5.1', title: 'Data Retention', description: 'Entity retains personal information consistent with objectives', category: 'Privacy', priority: 'medium' },
      { control_id: 'P6.1', title: 'Data Disposal', description: 'Entity disposes of personal information securely', category: 'Privacy', priority: 'high' },
    ]

    // ISO 27001:2022 Annex A Controls
    const iso27001Controls = [
      { control_id: 'A.5.1', title: 'Policies for Information Security', description: 'Information security policy and topic-specific policies defined', category: 'Organizational Controls', priority: 'critical' },
      { control_id: 'A.5.2', title: 'Information Security Roles', description: 'Information security roles and responsibilities assigned', category: 'Organizational Controls', priority: 'high' },
      { control_id: 'A.5.3', title: 'Segregation of Duties', description: 'Conflicting duties and areas of responsibility segregated', category: 'Organizational Controls', priority: 'high' },
      { control_id: 'A.5.7', title: 'Threat Intelligence', description: 'Information about threats collected and analyzed', category: 'Organizational Controls', priority: 'medium' },
      { control_id: 'A.5.10', title: 'Acceptable Use', description: 'Rules for acceptable use of information and assets defined', category: 'Organizational Controls', priority: 'high' },
      { control_id: 'A.5.14', title: 'Information Transfer', description: 'Rules, procedures or agreements for information transfer', category: 'Organizational Controls', priority: 'medium' },
      { control_id: 'A.5.23', title: 'Information Security in Cloud', description: 'Processes for acquisition, use, management of cloud services', category: 'Organizational Controls', priority: 'high' },
      { control_id: 'A.6.1', title: 'Screening', description: 'Background verification checks carried out on candidates', category: 'People Controls', priority: 'medium' },
      { control_id: 'A.6.2', title: 'Terms of Employment', description: 'Employment contracts state responsibilities for information security', category: 'People Controls', priority: 'high' },
      { control_id: 'A.6.3', title: 'Security Awareness', description: 'Personnel receive appropriate awareness and training', category: 'People Controls', priority: 'high' },
      { control_id: 'A.7.1', title: 'Physical Security Perimeters', description: 'Security perimeters defined to protect areas with information', category: 'Physical Controls', priority: 'medium' },
      { control_id: 'A.7.2', title: 'Physical Entry', description: 'Secure areas protected by entry controls', category: 'Physical Controls', priority: 'medium' },
      { control_id: 'A.7.4', title: 'Physical Security Monitoring', description: 'Premises continuously monitored for unauthorized access', category: 'Physical Controls', priority: 'medium' },
      { control_id: 'A.8.1', title: 'User Endpoint Devices', description: 'Information on user endpoint devices protected', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.2', title: 'Privileged Access Rights', description: 'Allocation of privileged access rights restricted', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.3', title: 'Information Access Restriction', description: 'Access to information restricted per access control policy', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.4', title: 'Access to Source Code', description: 'Read and write access to source code controlled', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.5', title: 'Secure Authentication', description: 'Secure authentication technologies implemented', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.6', title: 'Capacity Management', description: 'Use of resources monitored and capacity planned', category: 'Technological Controls', priority: 'medium' },
      { control_id: 'A.8.8', title: 'Management of Technical Vulnerabilities', description: 'Information about technical vulnerabilities evaluated', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.9', title: 'Configuration Management', description: 'Configurations of hardware, software, services managed', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.10', title: 'Information Deletion', description: 'Information stored in systems deleted when no longer required', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.11', title: 'Data Masking', description: 'Data masking used per topic-specific policy', category: 'Technological Controls', priority: 'medium' },
      { control_id: 'A.8.12', title: 'Data Leakage Prevention', description: 'Data leakage prevention measures applied', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.16', title: 'Monitoring Activities', description: 'Networks, systems and applications monitored for anomalous behavior', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.23', title: 'Web Filtering', description: 'Access to external websites managed to reduce malicious content', category: 'Technological Controls', priority: 'medium' },
      { control_id: 'A.8.24', title: 'Cryptographic Controls', description: 'Rules for effective use of cryptography defined', category: 'Technological Controls', priority: 'critical' },
      { control_id: 'A.8.25', title: 'Secure Development Lifecycle', description: 'Rules for secure development of software established', category: 'Technological Controls', priority: 'high' },
      { control_id: 'A.8.28', title: 'Secure Coding', description: 'Secure coding principles applied to software development', category: 'Technological Controls', priority: 'high' },
    ]

    // GDPR Controls
    const gdprControls = [
      { control_id: 'GDPR.5', title: 'Principles of Processing', description: 'Personal data processed lawfully, fairly and transparently', category: 'Principles', priority: 'critical' },
      { control_id: 'GDPR.6', title: 'Lawfulness of Processing', description: 'Legal basis established for processing personal data', category: 'Lawfulness', priority: 'critical' },
      { control_id: 'GDPR.7', title: 'Conditions for Consent', description: 'Consent obtained in accordance with GDPR requirements', category: 'Consent', priority: 'critical' },
      { control_id: 'GDPR.12', title: 'Transparent Information', description: 'Information provided to data subjects in concise, transparent manner', category: 'Transparency', priority: 'high' },
      { control_id: 'GDPR.13', title: 'Information Collection', description: 'Information provided when personal data collected', category: 'Transparency', priority: 'high' },
      { control_id: 'GDPR.15', title: 'Right of Access', description: 'Data subject has right to access their personal data', category: 'Data Subject Rights', priority: 'critical' },
      { control_id: 'GDPR.16', title: 'Right to Rectification', description: 'Data subject has right to rectify inaccurate personal data', category: 'Data Subject Rights', priority: 'high' },
      { control_id: 'GDPR.17', title: 'Right to Erasure', description: 'Data subject has right to erasure (right to be forgotten)', category: 'Data Subject Rights', priority: 'critical' },
      { control_id: 'GDPR.20', title: 'Right to Data Portability', description: 'Data subject has right to receive data in structured format', category: 'Data Subject Rights', priority: 'high' },
      { control_id: 'GDPR.25', title: 'Data Protection by Design', description: 'Data protection by design and by default implemented', category: 'Security', priority: 'critical' },
      { control_id: 'GDPR.30', title: 'Records of Processing', description: 'Controller maintains records of processing activities', category: 'Accountability', priority: 'high' },
      { control_id: 'GDPR.32', title: 'Security of Processing', description: 'Appropriate technical and organizational measures implemented', category: 'Security', priority: 'critical' },
      { control_id: 'GDPR.33', title: 'Breach Notification', description: 'Personal data breaches notified to supervisory authority', category: 'Security', priority: 'critical' },
      { control_id: 'GDPR.35', title: 'Data Protection Impact Assessment', description: 'DPIA carried out for high-risk processing', category: 'Accountability', priority: 'high' },
      { control_id: 'GDPR.37', title: 'Data Protection Officer', description: 'DPO designated where required', category: 'Accountability', priority: 'medium' },
    ]

    // Combine all controls and add organization-specific data
    const allControls = [
      ...soc2Controls.map(c => ({ ...c, framework: 'SOC2', required_for: ['SOC2'], organization_id: profile.organization_id })),
      ...iso27001Controls.map(c => ({ ...c, framework: 'ISO27001', required_for: ['ISO27001'], organization_id: profile.organization_id })),
      ...gdprControls.map(c => ({ ...c, framework: 'GDPR', required_for: ['GDPR'], organization_id: profile.organization_id }))
    ]

    // Insert all controls
    const { data: insertedControls, error: insertError } = await supabase
      .from('compliance_controls')
      .insert(allControls)
      .select()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedControls.length} compliance controls`,
        summary: {
          soc2: soc2Controls.length,
          iso27001: iso27001Controls.length,
          gdpr: gdprControls.length,
          total: insertedControls.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Seed controls error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})