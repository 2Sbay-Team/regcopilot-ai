import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Check, TrendingUp, DollarSign, Zap, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MODEL_PRICING: Record<string, number> = {
  'google/gemini-2.5-flash': 0.05,
  'google/gemini-2.5-pro': 0.30,
  'openai/gpt-5-mini': 0.10,
  'openai/gpt-5': 0.30,
  'openai/gpt-5-nano': 0.05,
};

const PLAN_LIMITS: Record<string, { name: string; tokens: number; models: string[]; price: number }> = {
  free: { name: 'Free', tokens: 100000, models: ['google/gemini-2.5-flash'], price: 0 },
  pro: { name: 'Pro', tokens: 1000000, models: ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini'], price: 49 },
  enterprise: { name: 'Enterprise', tokens: 10000000, models: Object.keys(MODEL_PRICING), price: 299 },
};

const Usage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalTokens: 0,
    totalCost: 0,
    totalRequests: 0,
  });
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.organization_id) {
      loadSubscription();
      loadUsageData();
      loadBillingHistory();
    }
  }, [profile]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  const loadSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single();

    if (data) {
      setSubscription(data);
    }
  };

  const loadBillingHistory = async () => {
    if (!profile?.organization_id) return;

    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setBillingHistory(data);
    }
  };

  const loadUsageData = async () => {
    if (!profile?.organization_id) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: logs, error } = await supabase
      .from('model_usage_logs')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error loading usage:', error);
      return;
    }

    if (logs) {
      // Calculate daily trends
      const dailyMap = new Map();
      logs.forEach(log => {
        const date = new Date(log.created_at).toLocaleDateString();
        const existing = dailyMap.get(date) || { date, tokens: 0, cost: 0 };
        dailyMap.set(date, {
          date,
          tokens: existing.tokens + (log.prompt_tokens + log.completion_tokens),
          cost: existing.cost + log.cost_estimate,
        });
      });
      setDailyTrends(Array.from(dailyMap.values()));

      // Calculate model breakdown
      const modelMap = new Map();
      logs.forEach(log => {
        const existing = modelMap.get(log.model) || { model: log.model, cost: 0 };
        modelMap.set(log.model, {
          model: log.model,
          cost: existing.cost + log.cost_estimate,
        });
      });
      setModelBreakdown(Array.from(modelMap.values()));

      // Calculate monthly stats
      const totalTokens = logs.reduce((sum, log) => sum + log.prompt_tokens + log.completion_tokens, 0);
      const totalCost = logs.reduce((sum, log) => sum + log.cost_estimate, 0);
      setMonthlyStats({
        totalTokens,
        totalCost,
        totalRequests: logs.length,
      });
    }
  };

  const convertCurrency = (usdAmount: number): string => {
    const currency = profile?.preferred_currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(usdAmount);
  };

  const handleUpgrade = async (planTier: string) => {
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { action: 'create_checkout', plan_tier: planTier }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { action: 'create_portal' }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const currentPlan = PLAN_LIMITS[subscription?.plan_tier || 'free'];
  const usagePercentage = (monthlyStats.totalTokens / currentPlan.tokens) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('usage.title', language)}</h1>
        {subscription && subscription.plan_tier !== 'free' && (
          <Button onClick={handleManageBilling} variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            {t('usage.manageBilling', language)}
          </Button>
        )}
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">{t('usage.title', language).split(' & ')[0]}</TabsTrigger>
          <TabsTrigger value="billing">{t('usage.billingHistory', language)}</TabsTrigger>
          <TabsTrigger value="plans">{t('usage.availablePlans', language)}</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{t('usage.currentPlan', language)}</CardTitle>
              <CardDescription>
                <Badge variant={subscription?.plan_tier === 'free' ? 'secondary' : 'default'}>
                  {subscription?.plan_tier?.toUpperCase() || t('usage.free', language).toUpperCase()}
                </Badge>
                {subscription?.current_period_end && 
                  ` • ${t('usage.renews', language)} ${new Date(subscription.current_period_end).toLocaleDateString()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t('usage.tokenUsage', language)}</span>
                  <span>{monthlyStats.totalTokens.toLocaleString()} / {currentPlan.tokens.toLocaleString()}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('usage.totalRequests', language)}</p>
                  <p className="text-2xl font-bold">{monthlyStats.totalRequests.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('usage.totalCost', language)}</p>
                  <p className="text-2xl font-bold">{convertCurrency(monthlyStats.totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('usage.dailyTokenUsage', language)}</CardTitle>
                <CardDescription>{t('usage.last30Days', language)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('usage.costByModel', language)}</CardTitle>
                <CardDescription>{t('usage.distributionBreakdown', language)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={modelBreakdown}
                      dataKey="cost"
                      nameKey="model"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {modelBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('usage.billingHistory', language)}</CardTitle>
              <CardDescription>{t('usage.billingHistoryDesc', language)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('usage.date', language)}</TableHead>
                    <TableHead>{t('usage.description', language)}</TableHead>
                    <TableHead>{t('usage.amount', language)}</TableHead>
                    <TableHead>{t('usage.status', language)}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {t('usage.noBillingHistory', language)}
                      </TableCell>
                    </TableRow>
                  ) : (
                    billingHistory.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.description || t('usage.subscriptionPayment', language)}</TableCell>
                        <TableCell>${(invoice.amount / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'succeeded' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.invoice_pdf && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Available Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PLAN_LIMITS).map(([tier, plan]) => (
              <Card key={tier} className={tier === subscription?.plan_tier ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {tier === subscription?.plan_tier && (
                      <Badge>Current</Badge>
                    )}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="mr-2 h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm">{plan.tokens.toLocaleString()} tokens/month</span>
                    </li>
                    {plan.models.map(model => (
                      <li key={model} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">{model}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                  {tier === subscription?.plan_tier ? (
                      <Button className="w-full" disabled>
                        {t('usage.currentPlanBadge', language)}
                      </Button>
                    ) : tier === 'free' ? (
                      <Button className="w-full" variant="outline" disabled>
                        {t('usage.downgradeToFree', language)}
                      </Button>
                    ) : tier === 'enterprise' ? (
                      <Button className="w-full" variant="outline" asChild>
                        <a href="mailto:sales@example.com">{t('usage.contactSales', language)}</a>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(tier)}
                        disabled={isUpgrading}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {isUpgrading ? t('usage.processing', language) : t('usage.upgrade', language)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Usage;
