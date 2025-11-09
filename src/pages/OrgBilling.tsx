import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import AppLayout from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { CreditCard, TrendingUp, Zap, Check, X } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const OrgBilling = () => {
  const navigate = useNavigate()
  const [organization, setOrganization] = useState<any>(null)
  const [usageSummary, setUsageSummary] = useState<any>(null)
  const [usageByModel, setUsageByModel] = useState<Record<string, any>>({})
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-summary')

      if (error) throw error

      if (data.type === 'organization') {
        setOrganization(data.organization)
        setUsageSummary(data.usage_summary)
        setUsageByModel(data.usage_by_model || {})
        setBillingHistory(data.billing_history || [])
      }
    } catch (error: any) {
      console.error('Billing load error:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      toast.loading('Creating checkout session...')
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { plan }
      })

      if (error) throw error

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast.error('Failed to start checkout')
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        { text: 'AI Act Auditor', included: true },
        { text: 'GDPR Checker', included: true },
        { text: 'ESG Reporter', included: false },
        { text: 'Up to 3 users', included: true },
        { text: 'Manual connectors only', included: true },
        { text: 'Basic support', included: true },
      ]
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      features: [
        { text: 'All Free features', included: true },
        { text: 'ESG Reporter', included: true },
        { text: 'Up to 10 users', included: true },
        { text: 'SharePoint, OneDrive, Slack', included: true },
        { text: 'GPT-4, Claude-3 access', included: true },
        { text: 'Priority support', included: true },
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        { text: 'All Pro features', included: true },
        { text: 'DORA, NIS2, DMA Copilots', included: true },
        { text: 'Unlimited users', included: true },
        { text: 'All connectors', included: true },
        { text: 'White-label option', included: true },
        { text: 'API access', included: true },
        { text: 'Dedicated support', included: true },
      ]
    },
  ]

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <CreditCard className="h-8 w-8 animate-pulse text-primary" />
        </div>
      </AppLayout>
    )
  }

  const usagePercent = organization?.llm_token_quota 
    ? Math.min(100, (organization.tokens_used_this_month / organization.llm_token_quota) * 100)
    : 0

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Billing & Usage
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and track usage
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage Details</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold capitalize">
                      {organization?.subscription_plan || 'Free'}
                    </span>
                    <Badge variant={organization?.billing_status === 'active' ? 'default' : 'secondary'}>
                      {organization?.billing_status || 'inactive'}
                    </Badge>
                  </div>
                  {organization?.subscription_plan !== 'enterprise' && (
                    <Button onClick={() => handleUpgrade('pro')} className="w-full">
                      Upgrade to Pro
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Usage</CardTitle>
                  <CardDescription>This month's LLM usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {(organization?.tokens_used_this_month || 0).toLocaleString()} / {(organization?.llm_token_quota || 0).toLocaleString()} tokens
                      </span>
                      <span>{usagePercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={usagePercent} />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated cost</span>
                      <span className="font-semibold">
                        ${(usageSummary?.total_cost || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Model</CardTitle>
                <CardDescription>LLM usage breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(usageByModel).map(([model, data]) => (
                      <TableRow key={model}>
                        <TableCell className="font-medium">{model}</TableCell>
                        <TableCell>{data.requests}</TableCell>
                        <TableCell>{data.tokens.toLocaleString()}</TableCell>
                        <TableCell>${data.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.name === organization?.subscription_plan ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.name === organization?.subscription_plan && (
                        <Badge>Current</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mt-0.5" />
                          )}
                          <span className={!feature.included ? 'text-muted-foreground' : ''}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {plan.name !== organization?.subscription_plan && (
                      <Button 
                        className="w-full" 
                        onClick={() => plan.name === 'Pro' ? handleUpgrade('pro') : null}
                        variant={plan.name === 'Enterprise' ? 'outline' : 'default'}
                      >
                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Recent billing events and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.processed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {event.event_type.replace(/\./g, ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={event.status === 'completed' || event.status === 'paid' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {event.amount ? `$${(event.amount / 100).toFixed(2)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

export default OrgBilling
