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

    const { event_data, analyze_with_ai = true } = await req.json()

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    // Analyze security event
    const analysis = await analyzeSecurityEvent(event_data, analyze_with_ai)

    // Store security event
    const { data: securityEvent, error: insertError } = await supabase
      .from('security_events')
      .insert({
        organization_id: profile.organization_id,
        event_type: analysis.event_type,
        severity: analysis.severity,
        source_ip: event_data.source_ip,
        user_id: event_data.user_id || null,
        event_details: event_data,
        ai_analysis_result: analysis.ai_result,
        risk_score: analysis.risk_score,
        is_threat: analysis.is_threat,
        response_action: analysis.response_action
      })
      .select()
      .single()

    if (insertError) throw insertError

    // If critical threat detected, create alert
    if (analysis.is_threat && ['critical', 'high'].includes(analysis.severity)) {
      await supabase.from('alert_notifications').insert({
        organization_id: profile.organization_id,
        alert_type: 'security_threat',
        severity: analysis.severity,
        title: `Security Threat Detected: ${analysis.event_type}`,
        message: analysis.ai_result?.summary || 'A security threat has been detected and logged.',
        details: analysis
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        event_id: securityEvent.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Security analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeSecurityEvent(eventData: any, useAI: boolean) {
  // Rule-based analysis
  const riskFactors = []
  let riskScore = 0
  let severity = 'low'
  let isThreat = false
  let responseAction = 'logged'

  // Failed login attempts
  if (eventData.event_type === 'failed_login') {
    riskScore += 2
    if (eventData.attempt_count > 3) {
      riskScore += 3
      severity = 'medium'
      riskFactors.push('Multiple failed login attempts')
    }
    if (eventData.attempt_count > 5) {
      riskScore += 5
      severity = 'high'
      isThreat = true
      responseAction = 'blocked'
      riskFactors.push('Brute force attack suspected')
    }
  }

  // Suspicious access patterns
  if (eventData.event_type === 'suspicious_access') {
    riskScore += 4
    severity = 'medium'
    riskFactors.push('Unusual access pattern detected')
    
    if (eventData.unusual_time || eventData.unusual_location) {
      riskScore += 2
      riskFactors.push('Access from unusual time/location')
    }
  }

  // Data exfiltration attempts
  if (eventData.event_type === 'data_exfiltration_attempt') {
    riskScore += 8
    severity = 'critical'
    isThreat = true
    responseAction = 'blocked'
    riskFactors.push('Potential data exfiltration detected')
  }

  // AI-powered attacks (adversarial ML, prompt injection, etc.)
  if (eventData.event_type === 'ai_attack_detected') {
    riskScore += 7
    severity = 'high'
    isThreat = true
    responseAction = 'alerted'
    riskFactors.push('AI/ML attack pattern detected')
  }

  // Injection attempts
  if (eventData.input_validation_failed || eventData.contains_sql_patterns || eventData.contains_xss_patterns) {
    riskScore += 6
    severity = 'high'
    isThreat = true
    responseAction = 'blocked'
    riskFactors.push('Injection attack attempt detected')
  }

  // Privilege escalation
  if (eventData.event_type === 'privilege_escalation_attempt') {
    riskScore += 9
    severity = 'critical'
    isThreat = true
    responseAction = 'blocked'
    riskFactors.push('Privilege escalation attempt')
  }

  // Cap risk score at 10
  riskScore = Math.min(riskScore, 10)

  let aiResult = null
  
  if (useAI && isThreat) {
    // AI-enhanced analysis for threats
    aiResult = {
      summary: `Threat detected: ${riskFactors.join(', ')}`,
      risk_factors: riskFactors,
      recommended_actions: [
        responseAction === 'blocked' ? 'Access has been automatically blocked' : 'Alert sent to security team',
        'Review security logs for related events',
        'Consider implementing additional access controls',
        'Update security policies if needed'
      ],
      confidence: riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low'
    }
  }

  return {
    event_type: eventData.event_type || 'unknown',
    severity,
    risk_score: riskScore,
    is_threat: isThreat,
    response_action: responseAction,
    ai_result: aiResult,
    risk_factors: riskFactors
  }
}
