// ============================================================================
// PHASE 5: LLM Usage & Reliability Analytics Dashboard
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  DollarSign,
  Zap,
  RefreshCw,
  Database,
  Clock
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  fallbackRate: number;
  avgLatency: number;
  activeProvider: string;
  activeModel: string;
}

interface ModuleUsage {
  module: string;
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
  fallbackCount: number;
}

interface DailyUsage {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
  fallbacks: number;
}

interface ProviderBreakdown {
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function LLMAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [moduleUsage, setModuleUsage] = useState<ModuleUsage[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [providerBreakdown, setProviderBreakdown] = useState<ProviderBreakdown[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrganization();
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      loadAnalytics();
    }
  }, [organizationId]);

  const loadOrganization = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load organization",
        variant: "destructive"
      });
    } else if (data) {
      setOrganizationId(data.organization_id);
    }
  };

  const loadAnalytics = async () => {
    if (!organizationId) return;

    setLoading(true);
    setRefreshing(true);

    try {
      // Get all usage logs for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: usageLogs, error } = await supabase
        .from('model_usage_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!usageLogs || usageLogs.length === 0) {
        setMetrics({
          totalRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          fallbackRate: 0,
          avgLatency: 0,
          activeProvider: 'None',
          activeModel: 'None'
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Calculate overall metrics
      const totalRequests = usageLogs.length;
      const totalTokens = usageLogs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
      const totalCost = usageLogs.reduce((sum, log) => sum + Number(log.cost_estimate || 0), 0);
      const fallbackCount = usageLogs.filter(log => (log as any).fallback_used).length;
      const fallbackRate = (fallbackCount / totalRequests) * 100;
      const avgLatency = usageLogs.reduce((sum, log) => sum + ((log as any).latency_ms || 0), 0) / totalRequests;

      // Get most recent provider/model
      const activeProvider = usageLogs[0]?.model?.split('/')[0] || 'Unknown';
      const activeModel = usageLogs[0]?.model || 'Unknown';

      setMetrics({
        totalRequests,
        totalTokens,
        totalCost,
        fallbackRate,
        avgLatency,
        activeProvider,
        activeModel
      });

      // Calculate daily usage for chart
      const dailyMap = new Map<string, DailyUsage>();
      usageLogs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const existing = dailyMap.get(date) || {
          date,
          cost: 0,
          tokens: 0,
          requests: 0,
          fallbacks: 0
        };

        dailyMap.set(date, {
          date,
          cost: existing.cost + Number(log.cost_estimate || 0),
          tokens: existing.tokens + (log.total_tokens || 0),
          requests: existing.requests + 1,
          fallbacks: existing.fallbacks + ((log as any).fallback_used ? 1 : 0)
        });
      });

      const dailyData = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Last 14 days

      setDailyUsage(dailyData);

      // Calculate provider breakdown
      const providerMap = new Map<string, ProviderBreakdown>();
      usageLogs.forEach(log => {
        const provider = log.model?.split('/')[0] || 'Unknown';
        const existing = providerMap.get(provider) || {
          provider,
          requests: 0,
          tokens: 0,
          cost: 0
        };

        providerMap.set(provider, {
          provider,
          requests: existing.requests + 1,
          tokens: existing.tokens + (log.total_tokens || 0),
          cost: existing.cost + Number(log.cost_estimate || 0)
        });
      });

      setProviderBreakdown(Array.from(providerMap.values()));

      // Calculate module usage (extract from request_payload or custom_endpoint)
      const moduleMap = new Map<string, ModuleUsage>();
      usageLogs.forEach(log => {
        const module = log.custom_endpoint || 'default';
        const existing = moduleMap.get(module) || {
          module,
          requests: 0,
          tokens: 0,
          cost: 0,
          avgLatency: 0,
          fallbackCount: 0
        };

        moduleMap.set(module, {
          module,
          requests: existing.requests + 1,
          tokens: existing.tokens + (log.total_tokens || 0),
          cost: existing.cost + Number(log.cost_estimate || 0),
          avgLatency: existing.avgLatency + ((log as any).latency_ms || 0),
          fallbackCount: existing.fallbackCount + ((log as any).fallback_used ? 1 : 0)
        });
      });

      const moduleData = Array.from(moduleMap.values()).map(m => ({
        ...m,
        avgLatency: m.avgLatency / m.requests
      }));

      setModuleUsage(moduleData);

      // Generate alerts
      const newAlerts: string[] = [];

      // Alert if fallback rate > 10% in last 24h
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);
      const last24hLogs = usageLogs.filter(log => new Date(log.timestamp).getTime() >= last24h.getTime());
      if (last24hLogs.length > 0) {
        const last24hFallbackRate = (last24hLogs.filter(log => (log as any).fallback_used).length / last24hLogs.length) * 100;
        if (last24hFallbackRate > 10) {
          newAlerts.push(`Critical: Fallback rate is ${last24hFallbackRate.toFixed(1)}% in the last 24 hours (threshold: 10%)`);
        }
      }

      // Alert if average latency > 5000ms
      if (avgLatency > 5000) {
        newAlerts.push(`Warning: Average latency is ${avgLatency.toFixed(0)}ms (threshold: 5000ms)`);
      }

      // Alert if daily cost spike
      if (dailyData.length >= 2) {
        const todayCost = dailyData[dailyData.length - 1].cost;
        const yesterdayCost = dailyData[dailyData.length - 2].cost;
        if (todayCost > yesterdayCost * 1.5 && todayCost > 1) {
          newAlerts.push(`Notice: Daily cost increased by ${(((todayCost - yesterdayCost) / yesterdayCost) * 100).toFixed(0)}%`);
        }
      }

      setAlerts(newAlerts);

    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            LLM Usage & Reliability
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of model performance and costs
          </p>
        </div>
        <Button onClick={loadAnalytics} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.startsWith('Critical') ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {alert.startsWith('Critical') ? 'Critical Alert' : 
                 alert.startsWith('Warning') ? 'Warning' : 'Notice'}
              </AlertTitle>
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Provider</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeProvider}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.activeModel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback Rate</CardTitle>
            {metrics && metrics.fallbackRate > 10 ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.fallbackRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics && metrics.fallbackRate > 10 ? 'Above threshold' : 'Within limits'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgLatency.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics && formatCost(metrics.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics && formatNumber(metrics.totalRequests)} requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="providers">Provider Breakdown</TabsTrigger>
          <TabsTrigger value="modules">Module Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Cost & Token Usage (Last 14 Days)</CardTitle>
              <CardDescription>Track spending and consumption trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#8884d8" name="Cost ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#82ca9d" name="Tokens" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Fallback Rate</CardTitle>
              <CardDescription>Monitor primary model reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fallbacks" fill="#FF8042" name="Fallback Requests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Distribution</CardTitle>
                <CardDescription>Requests by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={providerBreakdown}
                      dataKey="requests"
                      nameKey="provider"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {providerBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Cost Breakdown</CardTitle>
                <CardDescription>Total cost by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerBreakdown.map((provider, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium">{provider.provider}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCost(provider.cost)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(provider.tokens)} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Token Consumption by Module</CardTitle>
              <CardDescription>Usage breakdown across different copilots and features</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moduleUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tokens" fill="#8884d8" name="Tokens Used" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3">
                {moduleUsage.map((module, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{module.module}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatNumber(module.requests)} requests
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <div className="text-sm text-muted-foreground">Tokens</div>
                            <div className="font-bold">{formatNumber(module.tokens)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Cost</div>
                            <div className="font-bold">{formatCost(module.cost)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Latency</div>
                            <div className="font-bold">{module.avgLatency.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Fallbacks</div>
                            <Badge variant={module.fallbackCount > 0 ? 'destructive' : 'secondary'}>
                              {module.fallbackCount}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            30-Day Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
              <div className="text-2xl font-bold">{metrics && formatNumber(metrics.totalRequests)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Tokens</div>
              <div className="text-2xl font-bold">{metrics && formatNumber(metrics.totalTokens)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-2xl font-bold">{metrics && formatCost(metrics.totalCost)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Est. Monthly</div>
              <div className="text-2xl font-bold">
                {metrics && formatCost(metrics.totalCost * (30 / 30))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
