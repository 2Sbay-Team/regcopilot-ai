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
      organizationName: sanitizeInput(formData.organizationName),
      organizationType: sanitizeInput(formData.organizationType),
      entityType: sanitizeInput(formData.entityType),
      sectors: sanitizeInput(formData.sectors),
      criticalServices: sanitizeInput(formData.criticalServices || ''),
      incidentResponse: sanitizeInput(formData.incidentResponse || ''),
      vulnerabilityManagement: sanitizeInput(formData.vulnerabilityManagement || '')
    }

    console.log('Processing NIS2 assessment for:', sanitizedData.organizationName)

    // Create AI analysis prompt
    const systemPrompt = `You are an expert in NIS2 (Network and Information Security Directive 2) compliance analysis. 
Analyze the organization's information and provide:
1. Risk classification (Essential Entity or Important Entity)
2. Compliance score (0-100)
3. Specific recommendations for improvement
4. Summary of findings

Respond in JSON format with: { riskClassification, complianceScore, recommendations, summary }`

    const userContext = {
      organization: sanitizedData.organizationName,
      type: sanitizedData.organizationType,
      entityType: sanitizedData.entityType,
      sectors: sanitizedData.sectors,
      criticalServices: sanitizedData.criticalServices,
      incidentResponse: sanitizedData.incidentResponse,
      vulnerabilityManagement: sanitizedData.vulnerabilityManagement
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
      .from('nis2_assessments')
      .insert({
        organization_id: profile.organization_id,
        organization_name: sanitizedData.organizationName,
        organization_type: sanitizedData.organizationType,
        entity_type: sanitizedData.entityType,
        sectors: sanitizedData.sectors,
        critical_services: sanitizedData.criticalServices,
        incident_response: sanitizedData.incidentResponse,
        vulnerability_management: sanitizedData.vulnerabilityManagement,
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

    console.log('NIS2 assessment completed:', assessment.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment,
        message: 'NIS2 assessment completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in nis2-assessor:', error)
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