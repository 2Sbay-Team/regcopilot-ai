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
      platformName: sanitizeInput(formData.platformName),
      platformType: sanitizeInput(formData.platformType),
      monthlyUsers: sanitizeInput(formData.monthlyUsers),
      operatesInEu: formData.operatesInEu === true,
      businessUsers: sanitizeInput(formData.businessUsers || ''),
      dataPractices: sanitizeInput(formData.dataPractices || ''),
      advertisingPractices: sanitizeInput(formData.advertisingPractices || ''),
      interoperability: sanitizeInput(formData.interoperability || '')
    }

    console.log('Processing DMA assessment for:', sanitizedData.platformName)

    // Create AI analysis prompt
    const systemPrompt = `You are an expert in DMA (Digital Markets Act) compliance analysis for digital platforms. 
Analyze the platform's market position and compliance with DMA requirements:
1. Determine gatekeeper status based on user base and market position
2. Compliance score (0-100) based on DMA obligations
3. Specific recommendations for compliance
4. Summary of DMA obligations and current status

Respond in JSON format with: { gatekeeperStatus, complianceScore, recommendations, summary }`

    const userContext = {
      platform: sanitizedData.platformName,
      type: sanitizedData.platformType,
      monthlyUsers: sanitizedData.monthlyUsers,
      operatesInEU: sanitizedData.operatesInEu,
      businessUsers: sanitizedData.businessUsers,
      dataPractices: sanitizedData.dataPractices,
      advertising: sanitizedData.advertisingPractices,
      interoperability: sanitizedData.interoperability
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
      .from('dma_assessments')
      .insert({
        organization_id: profile.organization_id,
        platform_name: sanitizedData.platformName,
        platform_type: sanitizedData.platformType,
        monthly_users: sanitizedData.monthlyUsers,
        operates_in_eu: sanitizedData.operatesInEu,
        business_users: sanitizedData.businessUsers,
        data_practices: sanitizedData.dataPractices,
        advertising_practices: sanitizedData.advertisingPractices,
        interoperability: sanitizedData.interoperability,
        gatekeeper_status: analysis.gatekeeperStatus,
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

    console.log('DMA assessment completed:', assessment.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment,
        message: 'DMA assessment completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in dma-assessor:', error)
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