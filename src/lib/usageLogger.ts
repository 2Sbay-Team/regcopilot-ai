import { supabase } from "@/integrations/supabase/client"

/**
 * Model pricing table (USD per 1K tokens)
 */
export const MODEL_PRICING: Record<string, number> = {
  'google/gemini-2.5-flash': 0.05,
  'google/gemini-2.5-flash-lite': 0.02,
  'google/gemini-2.5-pro': 0.30,
  'openai/gpt-5': 0.30,
  'openai/gpt-5-mini': 0.10,
  'openai/gpt-5-nano': 0.05,
  'mistral-large-eu': 0.15,
  'custom': 0.10,
}

/**
 * Calculate cost estimate based on model and tokens used
 */
export function calculateCost(model: string, tokens: number): number {
  const pricePerK = MODEL_PRICING[model] || MODEL_PRICING['custom']
  return (tokens / 1000) * pricePerK
}

/**
 * Log AI model usage to Supabase
 * Call this after every AI API request to track usage and costs
 * 
 * @param organizationId - Organization UUID
 * @param model - Model identifier (e.g., 'google/gemini-2.5-flash')
 * @param promptTokens - Tokens used in the prompt
 * @param completionTokens - Tokens generated in the completion
 * @param requestPayload - Optional metadata about the request
 * @param customEndpoint - Optional custom endpoint URL if not using Lovable AI
 */
export async function logModelUsage(
  organizationId: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  requestPayload?: any,
  customEndpoint?: string
): Promise<void> {
  try {
    const totalTokens = promptTokens + completionTokens
    const costEstimate = calculateCost(model, totalTokens)

    const { error } = await supabase
      .from('model_usage_logs')
      .insert({
        organization_id: organizationId,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_estimate: costEstimate,
        request_payload: requestPayload || null,
        custom_endpoint: customEndpoint || null,
        status: 'success',
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log model usage:', error)
    }
  } catch (error) {
    console.error('Error in logModelUsage:', error)
  }
}

/**
 * Check if organization has exceeded their subscription limits
 * Returns { allowed: boolean, reason?: string }
 */
export async function checkSubscriptionLimits(organizationId: string): Promise<{
  allowed: boolean
  reason?: string
  usage?: { tokens: number; cost: number }
}> {
  try {
    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (!subscription) {
      return { 
        allowed: true, 
        reason: 'No subscription found, defaulting to free tier' 
      }
    }

    // Check if subscription is active
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      return {
        allowed: false,
        reason: `Subscription status: ${subscription.status}. Please update billing.`
      }
    }

    // Get current month usage
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('model_usage_logs')
      .select('total_tokens, cost_estimate')
      .eq('organization_id', organizationId)
      .gte('timestamp', firstDayOfMonth.toISOString())
      .eq('status', 'success')

    const totalTokens = usageData?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0
    const totalCost = usageData?.reduce((sum, log) => sum + Number(log.cost_estimate || 0), 0) || 0

    // Check against limits
    const monthlyLimit = subscription.monthly_token_limit || 10000

    if (totalTokens >= monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly token limit of ${monthlyLimit.toLocaleString()} exceeded. Current usage: ${totalTokens.toLocaleString()} tokens.`,
        usage: { tokens: totalTokens, cost: totalCost }
      }
    }

    return {
      allowed: true,
      usage: { tokens: totalTokens, cost: totalCost }
    }
  } catch (error) {
    console.error('Error checking subscription limits:', error)
    return { allowed: true, reason: 'Error checking limits, allowing request' }
  }
}

/**
 * Get allowed models for an organization based on their subscription plan
 */
export async function getAllowedModels(organizationId: string): Promise<string[]> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('organization_id', organizationId)
    .single()

  const plan = subscription?.plan || 'free'

  const modelsByPlan: Record<string, string[]> = {
    free: ['google/gemini-2.5-flash'],
    pro: [
      'google/gemini-2.5-flash',
      'google/gemini-2.5-pro',
      'openai/gpt-5-mini',
      'mistral-large-eu'
    ],
    enterprise: Object.keys(MODEL_PRICING)
  }

  return modelsByPlan[plan] || modelsByPlan.free
}