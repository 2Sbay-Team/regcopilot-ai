import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Pricing table (USD per 1K tokens)
const MODEL_PRICING: Record<string, number> = {
  'google/gemini-2.5-pro': 0.05,
  'google/gemini-2.5-flash': 0.02,
  'google/gemini-2.5-flash-lite': 0.01,
  'openai/gpt-5': 0.15,
  'openai/gpt-5-mini': 0.10,
  'openai/gpt-5-nano': 0.05,
  'mistral-large-eu': 0.15,
  'custom': 0.10, // Default cost for custom endpoints
}

// Lovable AI managed models
const LOVABLE_MODELS = [
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'google/gemini-2.5-flash-lite',
  'openai/gpt-5',
  'openai/gpt-5-mini',
  'openai/gpt-5-nano',
]

const RequestSchema = z.object({
  org_id: z.string().uuid(),
  model: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
  custom_endpoint: z.string().url().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
})

async function getUserFromRequest(supabaseClient: any, req: Request) {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) return user

  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7)
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload?.sub) return { id: payload.sub }
    } catch (_) {
      // ignore
    }
  }
  return null
}

function calculateCost(model: string, tokens: number): number {
  const pricePerK = MODEL_PRICING[model] || MODEL_PRICING['custom']
  return (tokens / 1000) * pricePerK
}

async function generateAuditHash(data: any): Promise<string> {
  const encoder = new TextEncoder()
  const dataStr = JSON.stringify(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataStr))
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const supabaseServiceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const user = await getUserFromRequest(supabaseClient, req)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const rawBody = await req.json()
    const validationResult = RequestSchema.safeParse(rawBody)
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request', 
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { org_id, messages, custom_endpoint, max_tokens, temperature } = validationResult.data
    let { model } = validationResult.data

    // Fetch organization budget settings
    const { data: budgetSettings, error: budgetError } = await supabaseServiceClient
      .from('organization_budgets')
      .select('*')
      .eq('organization_id', org_id)
      .single()

    // Use defaults if no settings found
    const dailyTokenLimit = budgetSettings?.daily_token_limit || 10000
    const dailyCostLimit = budgetSettings?.daily_cost_limit_usd || 10.00
    const fallbackModel = budgetSettings?.fallback_model || 'google/gemini-2.5-flash'
    const orgCustomUrl = budgetSettings?.custom_api_url

    // Check daily usage
    const { data: usageData } = await supabaseServiceClient
      .rpc('get_daily_token_usage', { org_id })

    const currentTokens = usageData?.[0]?.total_tokens || 0
    const currentCost = usageData?.[0]?.total_cost || 0

    console.log('Current usage:', { currentTokens, currentCost, dailyTokenLimit, dailyCostLimit })

    // Enforce budget limits
    if (currentTokens >= dailyTokenLimit) {
      return new Response(JSON.stringify({ 
        error: 'Budget limit exceeded',
        details: `Daily token limit of ${dailyTokenLimit} reached. Current usage: ${currentTokens} tokens.`,
        usage: { tokens: currentTokens, cost: currentCost }
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (currentCost >= dailyCostLimit) {
      return new Response(JSON.stringify({ 
        error: 'Budget limit exceeded',
        details: `Daily cost limit of $${dailyCostLimit} reached. Current usage: $${currentCost}.`,
        usage: { tokens: currentTokens, cost: currentCost }
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Determine model and endpoint
    let targetModel = model || fallbackModel
    let targetEndpoint = custom_endpoint || orgCustomUrl
    let isLovableManaged = LOVABLE_MODELS.includes(targetModel)

    // If model not specified, use fallback
    if (!model) {
      console.log(`No model specified, using fallback: ${fallbackModel}`)
      model = fallbackModel
      targetModel = fallbackModel
      isLovableManaged = LOVABLE_MODELS.includes(fallbackModel)
    }

    let aiResponse
    let responseData
    let usedModel = targetModel

    try {
      if (isLovableManaged) {
        // Route via Lovable AI Gateway
        console.log(`Routing to Lovable AI: ${targetModel}`)
        
        const requestBody: any = {
          model: targetModel,
          messages,
        }

        if (max_tokens) requestBody.max_tokens = max_tokens
        if (temperature !== undefined) requestBody.temperature = temperature

        aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            // Fallback on rate limit
            console.log('Rate limited, trying fallback model')
            usedModel = fallbackModel
            
            aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: fallbackModel,
                messages,
              }),
            })
          }

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text()
            throw new Error(`Lovable AI error (${aiResponse.status}): ${errorText}`)
          }
        }

        responseData = await aiResponse.json()

      } else if (targetEndpoint) {
        // Route to custom endpoint
        console.log(`Routing to custom endpoint: ${targetEndpoint}`)
        
        const customHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        const customApiKey = Deno.env.get('CUSTOM_API_KEY')
        if (customApiKey) {
          customHeaders['Authorization'] = `Bearer ${customApiKey}`
        }

        const requestBody: any = {
          model: targetModel,
          messages,
        }

        if (max_tokens) requestBody.max_tokens = max_tokens
        if (temperature !== undefined) requestBody.temperature = temperature

        aiResponse = await fetch(targetEndpoint, {
          method: 'POST',
          headers: customHeaders,
          body: JSON.stringify(requestBody),
        })

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text()
          throw new Error(`Custom endpoint error (${aiResponse.status}): ${errorText}`)
        }

        responseData = await aiResponse.json()

      } else {
        throw new Error('No valid endpoint available for model')
      }

      // Extract token usage
      const promptTokens = responseData.usage?.prompt_tokens || 0
      const completionTokens = responseData.usage?.completion_tokens || 0
      const totalTokens = responseData.usage?.total_tokens || promptTokens + completionTokens

      // Calculate cost
      const costEstimate = calculateCost(usedModel, totalTokens)

      // Generate audit hash
      const auditData = {
        org_id,
        model: usedModel,
        timestamp: new Date().toISOString(),
        tokens: totalTokens,
      }
      const auditHash = await generateAuditHash(auditData)

      // Log usage to database
      await supabaseServiceClient
        .from('model_usage_logs')
        .insert({
          organization_id: org_id,
          model: usedModel,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
          cost_estimate: costEstimate,
          request_payload: { messages: messages.length, model: targetModel },
          response_summary: { 
            content_length: responseData.choices?.[0]?.message?.content?.length || 0 
          },
          custom_endpoint: targetEndpoint || null,
          status: 'success',
        })

      // Return unified response
      return new Response(JSON.stringify({
        success: true,
        model_used: usedModel,
        response: responseData.choices?.[0]?.message?.content || '',
        reasoning: responseData.choices?.[0]?.message?.content || '',
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
        },
        cost_estimate: costEstimate,
        audit_hash: auditHash,
        budget_status: {
          tokens_remaining: dailyTokenLimit - (currentTokens + totalTokens),
          cost_remaining: dailyCostLimit - (currentCost + costEstimate),
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (modelError: any) {
      console.error('Model execution error:', modelError)

      // Log failed attempt
      await supabaseServiceClient
        .from('model_usage_logs')
        .insert({
          organization_id: org_id,
          model: targetModel,
          total_tokens: 0,
          cost_estimate: 0,
          request_payload: { messages: messages.length, model: targetModel },
          custom_endpoint: targetEndpoint || null,
          status: 'error',
          error_message: modelError.message,
        })

      return new Response(JSON.stringify({ 
        error: 'Model execution failed',
        details: modelError.message,
        model_attempted: targetModel,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error: any) {
    console.error('Gateway error:', error)
    return new Response(JSON.stringify({ 
      error: 'Gateway error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})