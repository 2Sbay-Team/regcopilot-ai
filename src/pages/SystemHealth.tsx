import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Activity, Shield, Database, TrendingUp, Network, Play, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function SystemHealth() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [securityAudit, setSecurityAudit] = useState<any>(null);
  const [stabilityReport, setStabilityReport] = useState<any>(null);
  const [predictiveScores, setPredictiveScores] = useState<any[]>([]);
  const [federatedRounds, setFederatedRounds] = useState<any[]>([]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      // Fetch latest health checks
      const { data: healthChecks } = await supabase
        .from('system_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(10);

      // Aggregate status
      const critical = healthChecks?.filter((h) => h.status === 'critical').length || 0;
      const warnings = healthChecks?.filter((h) => h.status === 'warning').length || 0;
      const healthy = healthChecks?.filter((h) => h.status === 'healthy').length || 0;

      setHealthStatus({
        overall: critical > 0 ? 'critical' : warnings > 0 ? 'warning' : 'healthy',
        critical,
        warnings,
        healthy,
        total: healthChecks?.length || 0,
        checks: healthChecks,
      });

      // Fetch security audit
      const { data: security } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setSecurityAudit({
        findings: security,
        critical: security?.filter((s) => s.severity === 'critical').length || 0,
        warnings: security?.filter((s) => s.severity === 'warning').length || 0,
      });

      // Fetch stability report
      const { data: stability } = await supabase
        .from('stability_reports')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(1);

      setStabilityReport(stability?.[0]);

      // Fetch predictive scores (if user has org)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          const { data: predictions } = await supabase
            .from('predictive_compliance_scores')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('predicted_at', { ascending: false })
            .limit(3);

          setPredictiveScores(predictions || []);
        }
      }

      // Fetch federated learning rounds
      const { data: rounds } = await supabase
        .from('federated_learning_rounds')
        .select('*')
        .order('round_number', { ascending: false })
        .limit(5);

      setFederatedRounds(rounds || []);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system health data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('system-health-check');
      if (error) throw error;
      toast({ title: 'Health check completed' });
      fetchHealthData();
    } catch (error) {
      toast({ title: 'Health check failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('security-audit-scan');
      if (error) throw error;
      toast({ title: 'Security scan completed' });
      fetchHealthData();
    } catch (error) {
      toast({ title: 'Security scan failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const runSelfHealing = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('self-healing-engine');
      if (error) throw error;
      toast({ title: 'Self-healing engine executed' });
      fetchHealthData();
    } catch (error) {
      toast({ title: 'Self-healing failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateStabilityReport = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('generate-stability-report');
      if (error) throw error;
      toast({ title: 'Stability report generated' });
      fetchHealthData();
    } catch (error) {
      toast({ title: 'Report generation failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health & Monitoring</h1>
          <p className="text-muted-foreground">Phase 5-8 Autonomous Operations Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchHealthData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runHealthCheck} size="sm" disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            Run Health Check
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${getStatusColor(healthStatus?.overall || 'unknown')} flex items-center justify-center text-white text-2xl font-bold`}>
                {healthStatus?.total || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total Checks</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{healthStatus?.healthy || 0}</div>
              <p className="text-sm text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{healthStatus?.warnings || 0}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{healthStatus?.critical || 0}</div>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="stability">Stability</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="federated">Federated</TabsTrigger>
        </TabsList>

        {/* Health Checks Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Checks</CardTitle>
              <CardDescription>Component-level system diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthStatus?.checks?.map((check: any) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{check.component}</div>
                      <div className="text-sm text-muted-foreground">{check.check_type}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {check.latency_ms && (
                        <span className="text-sm">{check.latency_ms}ms</span>
                      )}
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={runSecurityScan} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
            <Button onClick={runSelfHealing} variant="outline" disabled={loading}>
              <Activity className="h-4 w-4 mr-2" />
              Run Self-Healing
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Audit Results</CardTitle>
              <CardDescription>
                {securityAudit?.critical} critical, {securityAudit?.warnings} warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityAudit?.findings?.map((finding: any) => (
                  <Alert key={finding.id} variant={finding.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>{finding.audit_type}</strong>: {finding.finding}
                        </div>
                        <Badge variant={finding.auto_fixed ? 'outline' : 'secondary'}>
                          {finding.auto_fixed ? 'Auto-Fixed' : finding.remediation_status}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stability Tab */}
        <TabsContent value="stability" className="space-y-4">
          <Button onClick={generateStabilityReport} disabled={loading}>
            <Database className="h-4 w-4 mr-2" />
            Generate Report
          </Button>

          {stabilityReport && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Stability Report</CardTitle>
                <CardDescription>
                  Generated {new Date(stabilityReport.generated_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Readiness Score</span>
                      <span className="text-2xl font-bold">{stabilityReport.metrics?.readiness_score || 0}/100</span>
                    </div>
                    <Progress value={stabilityReport.metrics?.readiness_score || 0} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Issues Found</div>
                      <div className="text-2xl font-bold">{stabilityReport.issues_found}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Auto-Fixes Applied</div>
                      <div className="text-2xl font-bold">{stabilityReport.auto_fixes_applied}</div>
                    </div>
                  </div>

                  {getStatusBadge(stabilityReport.status)}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive Compliance Analysis
              </CardTitle>
              <CardDescription>Phase 7: Future compliance drift forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveScores.map((score: any) => (
                  <div key={score.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{score.prediction_horizon_days}-Day Forecast</span>
                      <Badge>{(score.confidence_level * 100).toFixed(0)}% confidence</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">AI Act</div>
                        <div className="text-lg font-bold">{score.predicted_ai_act_score?.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">GDPR</div>
                        <div className="text-lg font-bold">{score.predicted_gdpr_score?.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">ESG</div>
                        <div className="text-lg font-bold">{score.predicted_esg_score?.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Federated Learning Tab */}
        <TabsContent value="federated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Federated Learning Network
              </CardTitle>
              <CardDescription>Phase 8: Cross-organization collaborative intelligence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {federatedRounds.map((round: any) => (
                  <div key={round.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Round #{round.round_number}</span>
                      <Badge>{round.participating_orgs} organizations</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Model: {round.model_version} | Privacy: {round.privacy_guarantee}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
