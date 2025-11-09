import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sanitizeInput, createStructuredMessages } from '../_shared/sanitize.ts'

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
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

    // Get organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const formData = await req.json()
    
    // Sanitize inputs
    const sanitizedData = {
      institutionName: sanitizeInput(formData.institutionName),
      institutionType: sanitizeInput(formData.institutionType),
      ictServices: sanitizeInput(formData.ictServices),
      thirdPartyProviders: sanitizeInput(formData.thirdPartyProviders),
      incidentManagement: sanitizeInput(formData.incidentManagement || ''),
      testingFrequency: sanitizeInput(formData.testingFrequency),
      recoveryTimeObjective: sanitizeInput(formData.recoveryTimeObjective || ''),
      businessContinuityPlan: sanitizeInput(formData.businessContinuityPlan || '')
    }

    console.log('Processing DORA assessment for:', sanitizedData.institutionName)

    // Create AI analysis prompt
    const systemPrompt = `You are an expert in DORA (Digital Operational Resilience Act) compliance analysis for financial institutions. 
Analyze the institution's operational resilience and provide:
1. Risk classification based on ICT dependencies
2. Compliance score (0-100)
3. Specific recommendations aligned with DORA requirements
4. Summary of digital operational resilience status

Respond in JSON format with: { riskClassification, complianceScore, recommendations, summary }`

    const userContext = {
      institution: sanitizedData.institutionName,
      type: sanitizedData.institutionType,
      ictServices: sanitizedData.ictServices,
      thirdPartyProviders: sanitizedData.thirdPartyProviders,
      incidentManagement: sanitizedData.incidentManagement,
      testingFrequency: sanitizedData.testingFrequency,
      rto: sanitizedData.recoveryTimeObjective,
      bcp: sanitizedData.businessContinuityPlan
    }

    const messages = createStructuredMessages(systemPrompt, userContext)

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        response_format: { type: 'json_object' }
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI Gateway error:', aiResponse.status, errorText)
      throw new Error(`AI analysis failed: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const analysis = JSON.parse(aiData.choices[0].message.content)

    console.log('AI Analysis:', analysis)

    // Store assessment in database
    const { data: assessment, error: dbError } = await supabase
      .from('dora_assessments')
      .insert({
        organization_id: profile.organization_id,
        institution_name: sanitizedData.institutionName,
        institution_type: sanitizedData.institutionType,
        ict_services: sanitizedData.ictServices,
        third_party_providers: sanitizedData.thirdPartyProviders,
        incident_management: sanitizedData.incidentManagement,
        testing_frequency: sanitizedData.testingFrequency,
        recovery_time_objective: sanitizedData.recoveryTimeObjective,
        business_continuity_plan: sanitizedData.businessContinuityPlan,
        risk_classification: analysis.riskClassification,
        compliance_score: analysis.complianceScore,
        recommendations: analysis.recommendations,
        report_summary: analysis.summary
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save assessment')
    }

    console.log('DORA assessment completed:', assessment.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment,
        message: 'DORA assessment completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in dora-assessor:', error)
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