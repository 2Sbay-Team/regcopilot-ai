import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log('Stripe webhook event:', event.type)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organization_id
        const plan = session.metadata?.plan

        if (!organizationId || !plan) {
          console.error('Missing metadata in checkout session')
          break
        }

        // Define feature sets for each plan
        const featureMap: Record<string, any> = {
          pro: {
            ai_act: true,
            gdpr: true,
            esg: true,
            connectors: ['manual', 'sharepoint', 'onedrive', 'slack'],
            max_users: 10,
            llm_models: ['gpt-4', 'claude-3'],
            max_tokens: 1000000,
          },
          enterprise: {
            ai_act: true,
            gdpr: true,
            esg: true,
            dora: true,
            nis2: true,
            dma: true,
            connectors: ['all'],
            max_users: -1,
            llm_models: ['all'],
            max_tokens: -1,
            white_label: true,
            api_access: true,
          },
        }

        // Update organization
        await supabase
          .from('organizations')
          .update({
            subscription_plan: plan,
            billing_status: 'active',
            stripe_subscription_id: session.subscription as string,
            subscription_features: featureMap[plan] || featureMap.pro,
          })
          .eq('id', organizationId)

        // Log billing event
        await supabase.from('billing_events').insert({
          organization_id: organizationId,
          event_type: 'subscription.created',
          stripe_event_id: event.id,
          subscription_id: session.subscription as string,
          customer_id: session.customer as string,
          status: 'completed',
          metadata: { plan, session_id: session.id },
        })

        console.log(`Subscription activated for org ${organizationId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find organization by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) {
          console.error('Organization not found for customer', customerId)
          break
        }

        await supabase
          .from('organizations')
          .update({
            billing_status: subscription.status === 'active' ? 'active' : subscription.status,
          })
          .eq('id', org.id)

        await supabase.from('billing_events').insert({
          organization_id: org.id,
          event_type: 'subscription.updated',
          stripe_event_id: event.id,
          subscription_id: subscription.id,
          customer_id: customerId,
          status: subscription.status,
          metadata: { status: subscription.status },
        })

        console.log(`Subscription updated for org ${org.id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) break

        await supabase
          .from('organizations')
          .update({
            billing_status: 'canceled',
            subscription_plan: 'free',
            subscription_features: {
              ai_act: true,
              gdpr: true,
              esg: false,
              connectors: ['manual'],
              max_users: 3,
            },
          })
          .eq('id', org.id)

        await supabase.from('billing_events').insert({
          organization_id: org.id,
          event_type: 'subscription.canceled',
          stripe_event_id: event.id,
          subscription_id: subscription.id,
          customer_id: customerId,
          status: 'canceled',
        })

        console.log(`Subscription canceled for org ${org.id}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) break

        await supabase.from('billing_events').insert({
          organization_id: org.id,
          event_type: 'payment.succeeded',
          stripe_event_id: event.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          customer_id: customerId,
          status: 'paid',
          metadata: { invoice_id: invoice.id },
        })

        console.log(`Payment succeeded for org ${org.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!org) break

        await supabase
          .from('organizations')
          .update({ billing_status: 'past_due' })
          .eq('id', org.id)

        await supabase.from('billing_events').insert({
          organization_id: org.id,
          event_type: 'payment.failed',
          stripe_event_id: event.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          customer_id: customerId,
          status: 'failed',
          metadata: { invoice_id: invoice.id },
        })

        console.log(`Payment failed for org ${org.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
