import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Zap, DollarSign, Activity, Settings, TrendingUp, AlertCircle, PieChart as PieChartIcon, BarChart3 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIGatewayTester } from "@/components/AIGatewayTester"
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, subDays, parseISO } from "date-fns"

const AIGateway = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [budgetSettings, setBudgetSettings] = useState<any>(null)
  const [usageLogs, setUsageLogs] = useState<any[]>([])
  const [dailyUsage, setDailyUsage] = useState<any>(null)
  const { toast } = useToast()

  // Form state
  const [dailyTokenLimit, setDailyTokenLimit] = useState<number>(10000)
  const [dailyCostLimit, setDailyCostLimit] = useState<number>(10.00)
  const [fallbackModel, setFallbackModel] = useState<string>('google/gemini-2.5-flash')
  const [customApiUrl, setCustomApiUrl] = useState<string>('')

  // Analytics state
  const [dailyTrends, setDailyTrends] = useState<any[]>([])
  const [modelBreakdown, setModelBreakdown] = useState<any[]>([])
  const [forecast, setForecast] = useState<any[]>([])

  // Alert state
  const [alertsShown, setAlertsShown] = useState<{
    tokens80: boolean;
    tokens90: boolean;
    cost80: boolean;
    cost90: boolean;
  }>({
    tokens80: false,
    tokens90: false,
    cost80: false,
    cost90: false,
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadBudgetSettings()
      loadUsageLogs()
      loadDailyUsage()
      loadAnalytics()
      setupRealtimeSubscription()
    }
  }, [profile])

  // Reset alerts when date changes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setAlertsShown({
          tokens80: false,
          tokens90: false,
          cost80: false,
          cost90: false,
        })
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const loadBudgetSettings = async () => {
    const { data, error } = await supabase
      .from('organization_budgets')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (data) {
      setBudgetSettings(data)
      setDailyTokenLimit(data.daily_token_limit)
      setDailyCostLimit(Number(data.daily_cost_limit_usd))
      setFallbackModel(data.fallback_model)
      setCustomApiUrl(data.custom_api_url || '')
    }
  }

  const loadUsageLogs = async () => {
    const { data } = await supabase
      .from('model_usage_logs')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('timestamp', { ascending: false })
      .limit(20)

    setUsageLogs(data || [])
  }

  const loadDailyUsage = async () => {
    const { data, error } = await supabase
      .rpc('get_daily_token_usage', { org_id: profile.organization_id.toString() })

    if (data && data.length > 0) {
      setDailyUsage(data[0])
    }
  }

  const loadAnalytics = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30)
    
    const { data: logs, error } = await supabase
      .from("model_usage_logs")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .gte("timestamp", thirtyDaysAgo.toISOString())
      .eq("status", "success")
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Error fetching analytics:", error)
      return
    }

    // Process daily trends
    const dailyMap = new Map<string, { cost: number; tokens: number }>()
    const modelMap = new Map<string, { cost: number; tokens: number; requests: number }>()

    logs?.forEach((log) => {
      const day = format(parseISO(log.timestamp), "MMM dd")
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

    setDailyTrends(trends)
    setModelBreakdown(breakdown)

    // Simple linear regression for forecasting
    if (trends.length >= 7) {
      const lastWeek = trends.slice(-7)
      const avgDailyCost = lastWeek.reduce((sum, d) => sum + d.cost, 0) / lastWeek.length
      
      const forecastData = Array.from({ length: 7 }, (_, i) => ({
        day: `Day +${i + 1}`,
        predicted: Number((avgDailyCost * (1 + i * 0.05)).toFixed(4)),
      }))
      
      setForecast(forecastData)
    }
  }

  const checkBudgetAlerts = (currentTokens: number, currentCost: number) => {
    const tokenPercentage = (currentTokens / dailyTokenLimit) * 100
    const costPercentage = (currentCost / dailyCostLimit) * 100

    // Token alerts
    if (tokenPercentage >= 90 && !alertsShown.tokens90) {
      toast({
        title: "⚠️ Critical: Token Limit",
        description: `You've used ${tokenPercentage.toFixed(1)}% of your daily token limit (${currentTokens.toLocaleString()}/${dailyTokenLimit.toLocaleString()})`,
        variant: "destructive",
      })
      setAlertsShown(prev => ({ ...prev, tokens90: true }))
    } else if (tokenPercentage >= 80 && !alertsShown.tokens80) {
      toast({
        title: "⚠️ Warning: Token Usage High",
        description: `You've used ${tokenPercentage.toFixed(1)}% of your daily token limit (${currentTokens.toLocaleString()}/${dailyTokenLimit.toLocaleString()})`,
      })
      setAlertsShown(prev => ({ ...prev, tokens80: true }))
    }

    // Cost alerts
    if (costPercentage >= 90 && !alertsShown.cost90) {
      toast({
        title: "⚠️ Critical: Cost Limit",
        description: `You've used ${costPercentage.toFixed(1)}% of your daily cost limit ($${currentCost.toFixed(2)}/$${dailyCostLimit.toFixed(2)})`,
        variant: "destructive",
      })
      setAlertsShown(prev => ({ ...prev, cost90: true }))
    } else if (costPercentage >= 80 && !alertsShown.cost80) {
      toast({
        title: "⚠️ Warning: Cost Usage High",
        description: `You've used ${costPercentage.toFixed(1)}% of your daily cost limit ($${currentCost.toFixed(2)}/$${dailyCostLimit.toFixed(2)})`,
      })
      setAlertsShown(prev => ({ ...prev, cost80: true }))
    }
  }

  const setupRealtimeSubscription = () => {
    if (!profile?.organization_id) return

    const channel = supabase
      .channel('model-usage-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'model_usage_logs',
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        async (payload) => {
          console.log('New model usage:', payload)
          
          // Refresh usage data
          await loadDailyUsage()
          await loadUsageLogs()
          await loadAnalytics()

          // Check if we need to show alerts
          const { data } = await supabase
            .rpc('get_daily_token_usage', { org_id: profile.organization_id.toString() })

          if (data && data.length > 0) {
            const usage = data[0]
            checkBudgetAlerts(
              Number(usage.total_tokens || 0),
              Number(usage.total_cost || 0)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const saveBudgetSettings = async () => {
    setLoading(true)
    try {
      const settingsData = {
        organization_id: profile.organization_id,
        daily_token_limit: dailyTokenLimit,
        daily_cost_limit_usd: dailyCostLimit,
        fallback_model: fallbackModel,
        custom_api_url: customApiUrl || null,
      }

      if (budgetSettings) {
        // Update existing
        const { error } = await supabase
          .from('organization_budgets')
          .update(settingsData)
          .eq('id', budgetSettings.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('organization_budgets')
          .insert(settingsData)

        if (error) throw error
      }

      toast({
        title: "Settings Saved",
        description: "AI Gateway budget settings updated successfully"
      })

      loadBudgetSettings()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl tracking-tight mb-2 heading-dual-tone">
          AI Gateway <span className="secondary">Controller</span>
        </h1>
        <p className="text-muted-foreground font-medium">
          Multi-tenant AI routing with cost control and usage tracking
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="tester">Tester</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">

          {/* Daily Usage Overview */}
          <div className="grid gap-6 md:grid-cols-3">
        <Card className="cockpit-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyUsage?.total_tokens?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage(dailyUsage?.total_tokens || 0, dailyTokenLimit) >= 90
                      ? 'bg-destructive'
                      : getUsagePercentage(dailyUsage?.total_tokens || 0, dailyTokenLimit) >= 80
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                  }`}
                  style={{
                    width: `${getUsagePercentage(
                      dailyUsage?.total_tokens || 0,
                      dailyTokenLimit
                    )}%`
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {dailyTokenLimit.toLocaleString()} limit
              </span>
            </div>
            {getUsagePercentage(dailyUsage?.total_tokens || 0, dailyTokenLimit) >= 80 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                High usage detected
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="cockpit-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(parseFloat(dailyUsage?.total_cost || 0))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage(parseFloat(dailyUsage?.total_cost || 0), dailyCostLimit) >= 90
                      ? 'bg-destructive'
                      : getUsagePercentage(parseFloat(dailyUsage?.total_cost || 0), dailyCostLimit) >= 80
                      ? 'bg-yellow-500'
                      : 'bg-accent'
                  }`}
                  style={{
                    width: `${getUsagePercentage(
                      parseFloat(dailyUsage?.total_cost || 0),
                      dailyCostLimit
                    )}%`
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ${dailyCostLimit.toFixed(2)} limit
              </span>
            </div>
            {getUsagePercentage(parseFloat(dailyUsage?.total_cost || 0), dailyCostLimit) >= 80 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                High usage detected
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="cockpit-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyUsage?.request_count?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              API calls made today
            </p>
          </CardContent>
        </Card>
          </div>

          {/* Recent Usage */}
          <Card className="cockpit-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Recent Usage
              </CardTitle>
              <CardDescription>Last 20 AI model requests</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLogs.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {usageLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.model}
                            </Badge>
                            <Badge
                              variant={log.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {log.status}
                            </Badge>
                            {log.custom_endpoint && (
                              <Badge variant="secondary" className="text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>

                          {log.error_message && (
                            <div className="flex items-start gap-1 text-xs text-destructive mt-1">
                              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{log.error_message}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          <div className="text-sm font-semibold">
                            {formatCost(parseFloat(log.cost_estimate))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.total_tokens.toLocaleString()} tokens
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No usage logs yet</p>
                  <p className="text-sm">Start making AI requests to see usage data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Spending Trends
              </CardTitle>
              <CardDescription>Cost and token usage over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Cost ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tokens"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Tokens"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No usage data available yet</p>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Model Usage Breakdown
                </CardTitle>
                <CardDescription>Cost distribution by model</CardDescription>
              </CardHeader>
              <CardContent>
                {modelBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={modelBreakdown}
                          dataKey="cost"
                          nameKey="model"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `$${entry.cost.toFixed(4)}`}
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
                            <span className="font-medium">{item.model}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {item.requests} requests • {item.tokens.toLocaleString()} tokens
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No model usage data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  7-Day Cost Forecast
                </CardTitle>
                <CardDescription>Predicted spending based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                {forecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`$${value}`, 'Predicted Cost']}
                      />
                      <Bar 
                        dataKey="predicted" 
                        fill="hsl(var(--primary))" 
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Need at least 7 days of data for forecasting
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Budget Settings */}
          <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Budget Settings
          </CardTitle>
          <CardDescription>Configure daily limits and fallback model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenLimit">Daily Token Limit</Label>
                <Input
                  id="tokenLimit"
                  type="number"
                  value={dailyTokenLimit}
                  onChange={(e) => setDailyTokenLimit(parseInt(e.target.value))}
                  placeholder="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costLimit">Daily Cost Limit (USD)</Label>
                <Input
                  id="costLimit"
                  type="number"
                  step="0.01"
                  value={dailyCostLimit}
                  onChange={(e) => setDailyCostLimit(parseFloat(e.target.value))}
                  placeholder="10.00"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fallback">Fallback Model</Label>
                <select
                  id="fallback"
                  value={fallbackModel}
                  onChange={(e) => setFallbackModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                  <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="openai/gpt-5-nano">GPT-5 Nano</option>
                  <option value="openai/gpt-5-mini">GPT-5 Mini</option>
                  <option value="openai/gpt-5">GPT-5</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customUrl">Custom API URL (Optional)</Label>
                <Input
                  id="customUrl"
                  type="url"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://api.custom-provider.com/v1/completions"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={saveBudgetSettings}
            disabled={loading}
            className="w-full mt-6"
          >
            <Settings className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tester" className="space-y-6">
          {profile?.organization_id && (
            <AIGatewayTester organizationId={profile.organization_id} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIGateway
