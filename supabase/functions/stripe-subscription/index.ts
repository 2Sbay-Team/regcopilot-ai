import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('stripe_payment')

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

    const { action, plan_tier } = await req.json()

    if (action === 'create_checkout') {
      // Create Stripe checkout session
      const priceMap = {
        pro: 'price_1234567890', // Replace with actual Stripe price IDs
        enterprise: 'price_0987654321'
      }

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'success_url': `${req.headers.get('origin')}/usage?success=true`,
          'cancel_url': `${req.headers.get('origin')}/usage?cancelled=true`,
          'mode': 'subscription',
          'line_items[0][price]': priceMap[plan_tier as keyof typeof priceMap],
          'line_items[0][quantity]': '1',
          'client_reference_id': profile.organization_id,
          'metadata[organization_id]': profile.organization_id,
        }),
      })

      const session = await response.json()

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'create_portal') {
      // Get customer ID from subscription
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('organization_id', profile.organization_id)
        .single()

      if (!subscription?.stripe_customer_id) {
        throw new Error('No active subscription found')
      }

      const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'customer': subscription.stripe_customer_id,
          'return_url': `${req.headers.get('origin')}/usage`,
        }),
      })

      const session = await response.json()

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'webhook') {
      // Handle Stripe webhooks
      const sig = req.headers.get('stripe-signature')
      // Verify webhook signature and process events
      // This is a simplified version - add proper webhook verification
      
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
