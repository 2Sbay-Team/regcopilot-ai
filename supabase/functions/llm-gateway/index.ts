import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')

// Simple XOR encryption for BYOK keys (in production, use proper encryption)
function decryptApiKey(encrypted: string): string {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  let decrypted = ''
  for (let i = 0; i < encrypted.length; i++) {
    decrypted += String.fromCharCode(
      encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return decrypted
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's organization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const { messages, model, max_tokens } = await req.json()
    const requestedTokens = max_tokens || 2000 // Estimate if not provided

    // Check quota before proceeding
    const { data: quotaCheck, error: quotaError } = await supabaseClient
      .rpc('check_token_quota', {
        org_id: profile.organization_id,
        requested_tokens: requestedTokens
      })

    if (quotaError) {
      console.error('Quota check error:', quotaError)
      throw new Error('Failed to check quota')
    }

    if (!quotaCheck.allowed) {
      return new Response(JSON.stringify({
        error: quotaCheck.reason || 'Quota exceeded',
        quota_info: quotaCheck
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get organization details for BYOK
    const { data: org } = await supabaseClient
      .from('organizations')
      .select('billing_model, byok_provider, byok_model, byok_api_key_encrypted')
      .eq('id', profile.organization_id)
      .single()

    let aiResponse
    let actualModel = model || 'google/gemini-2.5-flash'

    // Use BYOK if configured
    if (org?.billing_model === 'byok' && org.byok_api_key_encrypted) {
      const decryptedKey = decryptApiKey(org.byok_api_key_encrypted)
      actualModel = org.byok_model || actualModel

      // Route to appropriate provider
      if (org.byok_provider === 'openai') {
        aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${decryptedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: actualModel, messages }),
        })
      } else if (org.byok_provider === 'anthropic') {
        aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': decryptedKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: actualModel,
            messages,
            max_tokens: max_tokens || 2000
          }),
        })
      } else {
        throw new Error(`Unsupported BYOK provider: ${org.byok_provider}`)
      }
    } else {
      // Use Lovable AI Gateway
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured')
      }

      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: actualModel, messages }),
      })
    }

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded')
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted')
      }
      throw new Error(`AI request failed: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content || aiData.content?.[0]?.text || ''
    const tokensUsed = aiData.usage?.total_tokens || requestedTokens

    // Log usage
    await supabaseClient.from('model_usage_logs').insert({
      organization_id: profile.organization_id,
      model: actualModel,
      prompt_tokens: aiData.usage?.prompt_tokens || Math.floor(tokensUsed * 0.3),
      completion_tokens: aiData.usage?.completion_tokens || Math.floor(tokensUsed * 0.7),
      total_tokens: tokensUsed,
      cost_estimate: (tokensUsed / 1000) * 0.05, // Simplified cost
      status: 'success',
      custom_endpoint: org?.billing_model === 'byok' ? org.byok_provider : 'lovable_ai'
    })

    // Increment organization token usage (only for non-BYOK)
    if (org?.billing_model !== 'byok') {
      await supabaseClient.rpc('increment_token_usage', {
        org_id: profile.organization_id,
        tokens_consumed: tokensUsed
      })
    }

    // Report to Stripe for metered billing (paid plans only)
    if (org?.billing_model === 'paid') {
      await supabaseClient.from('stripe_usage_events').insert({
        organization_id: profile.organization_id,
        subscription_item_id: 'si_placeholder', // Get from subscription
        tokens_consumed: tokensUsed,
        cost_usd: (tokensUsed / 1000) * 0.05
      })
    }

    return new Response(JSON.stringify({
      content,
      model: actualModel,
      usage: {
        prompt_tokens: aiData.usage?.prompt_tokens,
        completion_tokens: aiData.usage?.completion_tokens,
        total_tokens: tokensUsed
      },
      quota_warning: quotaCheck.warning ? {
        level: quotaCheck.warning,
        message: quotaCheck.message,
        usage_percentage: quotaCheck.usage_percentage
      } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('LLM Gateway error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
