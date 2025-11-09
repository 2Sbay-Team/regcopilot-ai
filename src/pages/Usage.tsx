import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DollarSign, TrendingUp, Zap, CreditCard, ArrowUpRight } from "lucide-react"
import { format, subDays, parseISO } from "date-fns"

const MODEL_PRICING: Record<string, number> = {
  'google/gemini-2.5-flash': 0.05,
  'google/gemini-2.5-pro': 0.30,
  'openai/gpt-5-mini': 0.10,
  'openai/gpt-5': 0.30,
  'mistral-large-eu': 0.15,
}

const PLAN_LIMITS: Record<string, { tokens: number; models: string[]; price: number }> = {
  free: { tokens: 10000, models: ['google/gemini-2.5-flash'], price: 0 },
  pro: { tokens: 250000, models: ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'mistral-large-eu'], price: 29 },
  enterprise: { tokens: 2000000, models: Object.keys(MODEL_PRICING), price: 299 },
}

const Usage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [usageData, setUsageData] = useState<any[]>([])
  const [modelBreakdown, setModelBreakdown] = useState<any[]>([])
  const [monthlyStats, setMonthlyStats] = useState({ tokens: 0, cost: 0, requests: 0 })

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadSubscription()
      loadUsageData()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const loadSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single()

    setSubscription(data)
  }

  const loadUsageData = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30)
    
    const { data: logs } = await supabase
      .from('model_usage_logs')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .eq('status', 'success')
      .order('timestamp', { ascending: true })

    if (!logs) return

    // Process daily trends
    const dailyMap = new Map<string, { cost: number; tokens: number }>()
    const modelMap = new Map<string, { cost: number; tokens: number; requests: number }>()
    let totalTokens = 0
    let totalCost = 0
    let totalRequests = 0

    logs.forEach((log) => {
      const day = format(parseISO(log.timestamp), 'MMM dd')
      const existing = dailyMap.get(day) || { cost: 0, tokens: 0 }
      dailyMap.set(day, {
        cost: existing.cost + Number(log.cost_estimate || 0),
        tokens: existing.tokens + Number(log.total_tokens || 0),
      })

      const modelExisting = modelMap.get(log.model) || { cost: 0, tokens: 0, requests: 0 }
      modelMap.set(log.model, {
        cost: modelExisting.cost + Number(log.cost_estimate || 0),
        tokens: modelExisting.tokens + Number(log.total_tokens || 0),
        requests: modelExisting.requests + 1,
      })

      totalTokens += Number(log.total_tokens || 0)
      totalCost += Number(log.cost_estimate || 0)
      totalRequests += 1
    })

    const trends = Array.from(dailyMap.entries()).map(([day, data]) => ({
      day,
      cost: Number(data.cost.toFixed(4)),
      tokens: data.tokens,
    }))

    const breakdown = Array.from(modelMap.entries()).map(([model, data]) => ({
      model,
      cost: Number(data.cost.toFixed(4)),
      tokens: data.tokens,
      requests: data.requests,
    }))

    setUsageData(trends)
    setModelBreakdown(breakdown)
    setMonthlyStats({ tokens: totalTokens, cost: totalCost, requests: totalRequests })
  }

  const planConfig = subscription ? PLAN_LIMITS[subscription.plan] : PLAN_LIMITS.free
  const tokenUsagePercentage = (monthlyStats.tokens / planConfig.tokens) * 100

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Usage & Billing
        </h1>
        <p className="text-muted-foreground font-medium">
          Track token usage, costs, and manage your subscription
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="cockpit-panel border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Current Plan: <span className="capitalize">{subscription?.plan || 'Free'}</span>
              </CardTitle>
              <CardDescription>
                {subscription?.status === 'trialing' ? 
                  `Trial ends ${subscription.trial_end ? format(new Date(subscription.trial_end), 'MMM dd, yyyy') : 'soon'}` :
                  `Billing cycle renews ${subscription?.renewal_date ? format(new Date(subscription.renewal_date), 'MMM dd, yyyy') : 'N/A'}`
                }
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">${planConfig.price}</div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Token Usage</span>
              <span className="text-sm text-muted-foreground">
                {monthlyStats.tokens.toLocaleString()} / {planConfig.tokens.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  tokenUsagePercentage >= 90 ? 'bg-destructive' :
                  tokenUsagePercentage >= 80 ? 'bg-yellow-500' :
                  'bg-primary'
                }`}
                style={{ width: `${Math.min(tokenUsagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-2xl font-bold">{monthlyStats.requests.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Requests</div>
            </div>
            <div>
              <div className="text-2xl font-bold">${monthlyStats.cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{planConfig.models.length}</div>
              <div className="text-xs text-muted-foreground">Available Models</div>
            </div>
          </div>

          {subscription?.plan !== 'enterprise' && (
            <Button className="w-full mt-4">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cockpit-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Token Usage
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {usageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No usage data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="cockpit-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost by Model
            </CardTitle>
            <CardDescription>Distribution breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {modelBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={modelBreakdown}
                      dataKey="cost"
                      nameKey="model"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `$${entry.cost}`}
                    >
                      {modelBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {modelBreakdown.map((item, index) => (
                    <div key={item.model} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                        />
                        <span className="font-medium">{item.model.split('/')[1] || item.model}</span>
                      </div>
                      <div className="text-muted-foreground">
                        ${item.cost.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No model usage data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Compare features and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PLAN_LIMITS).map(([plan, config]) => (
              <Card key={plan} className={subscription?.plan === plan ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="capitalize">{plan}</CardTitle>
                  <div className="text-3xl font-bold">${config.price}</div>
                  <CardDescription>/month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      {config.tokens.toLocaleString()} tokens/month
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      {config.models.length} AI models
                    </div>
                  </div>
                  {subscription?.plan !== plan && (
                    <Button variant="outline" className="w-full">
                      {PLAN_LIMITS[subscription?.plan || 'free'].price < config.price ? 'Upgrade' : 'Change Plan'}
                    </Button>
                  )}
                  {subscription?.plan === plan && (
                    <Badge className="w-full justify-center">Current Plan</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Usage