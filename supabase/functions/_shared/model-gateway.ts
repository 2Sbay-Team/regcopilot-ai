// ============================================================================
// PHASE 2: Model Gateway with Automatic Fallback Logic
// ============================================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

interface ModelConfig {
  id: string
  provider: string
  model_name: string
  fallback_provider: string | null
  fallback_model_name: string | null
  max_timeout_ms: number
  cost_per_1k_tokens: number
}

interface ModelResponse {
  content: string
  tokens: {
    prompt: number
    completion: number
    total: number
  }
  cost: number
  latency_ms: number
}

/**
 * Get active model configuration for organization and task type
 */
export async function getActiveModelConfig(
  supabase: SupabaseClient,
  orgId: string,
  taskType: string = 'default',
  modelType: string = 'chat'
): Promise<ModelConfig | null> {
  const { data, error } = await supabase.rpc('get_active_model_config', {
    org_id: orgId,
    task_type: taskType,
    required_model_type: modelType
  })

  if (error || !data || data.length === 0) {
    console.error('Failed to get model config:', error)
    return null
  }

  return data[0] as ModelConfig
}

/**
 * Call AI model with timeout and error handling
 */
async function callModelWithTimeout(
  provider: string,
  modelName: string,
  messages: any[],
  timeoutMs: number,
  lovableApiKey: string
): Promise<ModelResponse> {
  const startTime = Date.now()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let response: Response

    if (provider === 'lovable' || provider === 'google' || provider === 'openai') {
      // Use Lovable AI Gateway
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages,
        }),
        signal: controller.signal
      })
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Model API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const latencyMs = Date.now() - startTime

    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0
    const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens

    return {
      content: data.choices?.[0]?.message?.content || '',
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      cost: 0, // Will be calculated based on config
      latency_ms: latencyMs
    }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Model request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Call model with automatic fallback on failure
 */
export async function callModelWithFallback(
  supabase: SupabaseClient,
  orgId: string,
  messages: any[],
  taskType: string = 'default'
): Promise<{
  response: ModelResponse
  usedFallback: boolean
  fallbackReason?: string
  configId: string
}> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured')
  }

  // Get active model configuration
  const config = await getActiveModelConfig(supabase, orgId, taskType, 'chat')
  if (!config) {
    throw new Error('No active model configuration found')
  }

  let usedFallback = false
  let fallbackReason: string | undefined
  let response: ModelResponse

  try {
    // Try primary model
    console.log(`Calling primary model: ${config.provider}/${config.model_name}`)
    response = await callModelWithTimeout(
      config.provider,
      config.model_name,
      messages,
      config.max_timeout_ms,
      LOVABLE_API_KEY
    )
    
    // Calculate cost based on config
    response.cost = (response.tokens.total / 1000) * Number(config.cost_per_1k_tokens)

  } catch (primaryError: any) {
    console.warn('Primary model failed:', primaryError.message)
    
    // Check if fallback is configured
    if (!config.fallback_provider || !config.fallback_model_name) {
      throw new Error(`Primary model failed and no fallback configured: ${primaryError.message}`)
    }

    usedFallback = true
    fallbackReason = primaryError.message

    try {
      // Try fallback model
      console.log(`Switching to fallback: ${config.fallback_provider}/${config.fallback_model_name}`)
      response = await callModelWithTimeout(
        config.fallback_provider,
        config.fallback_model_name,
        messages,
        config.max_timeout_ms,
        LOVABLE_API_KEY
      )

      // Calculate cost (use same rate as primary for simplicity)
      response.cost = (response.tokens.total / 1000) * Number(config.cost_per_1k_tokens)

      // Log fallback alert
      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        agent: 'model_gateway',
        action: 'fallback_triggered',
        event_type: 'model_fallback',
        event_category: 'alert',
        request_payload: {
          primary_model: `${config.provider}/${config.model_name}`,
          fallback_model: `${config.fallback_provider}/${config.fallback_model_name}`,
          reason: fallbackReason
        },
        status: 'warning',
        timestamp: new Date().toISOString()
      })

    } catch (fallbackError: any) {
      throw new Error(`Both primary and fallback models failed: ${fallbackError.message}`)
    }
  }

  // Log usage
  await supabase.from('model_usage_logs').insert({
    organization_id: orgId,
    model: usedFallback 
      ? `${config.fallback_provider}/${config.fallback_model_name}`
      : `${config.provider}/${config.model_name}`,
    prompt_tokens: response.tokens.prompt,
    completion_tokens: response.tokens.completion,
    total_tokens: response.tokens.total,
    cost_estimate: response.cost,
    status: 'success',
    fallback_used: usedFallback,
    fallback_reason: fallbackReason,
    latency_ms: response.latency_ms,
    config_id: config.id
  })

  return {
    response,
    usedFallback,
    fallbackReason,
    configId: config.id
  }
}

/**
 * Get embedding with fallback support
 */
export async function getEmbeddingWithFallback(
  supabase: SupabaseClient,
  orgId: string,
  text: string,
  taskType: string = 'rag'
): Promise<{
  embedding: number[]
  usedFallback: boolean
  configId: string
}> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured')
  }

  const config = await getActiveModelConfig(supabase, orgId, taskType, 'embedding')
  if (!config) {
    throw new Error('No active embedding model configuration found')
  }

  let usedFallback = false

  try {
    // Try primary embedding model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model_name,
        input: text
      }),
      signal: AbortSignal.timeout(config.max_timeout_ms)
    })

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`)
    }

    const data = await response.json()
    const embedding = data.data[0].embedding

    // Log usage
    await supabase.from('model_usage_logs').insert({
      organization_id: orgId,
      model: `${config.provider}/${config.model_name}`,
      prompt_tokens: Math.floor(text.length / 4),
      completion_tokens: 0,
      total_tokens: Math.floor(text.length / 4),
      cost_estimate: (Math.floor(text.length / 4) / 1000) * Number(config.cost_per_1k_tokens),
      status: 'success',
      fallback_used: false,
      config_id: config.id
    })

    return { embedding, usedFallback: false, configId: config.id }

  } catch (error: any) {
    console.warn('Primary embedding model failed:', error.message)

    if (!config.fallback_provider || !config.fallback_model_name) {
      throw error
    }

    usedFallback = true

    // Try fallback - use simple fallback approach
    const fallbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.fallback_model_name,
        input: text
      })
    })

    if (!fallbackResponse.ok) {
      throw new Error('Both primary and fallback embedding models failed')
    }

    const data = await fallbackResponse.json()
    const embedding = data.data[0].embedding

    // Log fallback usage
    await supabase.from('model_usage_logs').insert({
      organization_id: orgId,
      model: `${config.fallback_provider}/${config.fallback_model_name}`,
      prompt_tokens: Math.floor(text.length / 4),
      completion_tokens: 0,
      total_tokens: Math.floor(text.length / 4),
      cost_estimate: (Math.floor(text.length / 4) / 1000) * Number(config.cost_per_1k_tokens),
      status: 'success',
      fallback_used: true,
      fallback_reason: error.message,
      config_id: config.id
    })

    return { embedding, usedFallback: true, configId: config.id }
  }
}
