import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlayCircle, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export default function QADashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [latestResults, setLatestResults] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRuns: 0,
    avgPassRate: 0,
    avgLatency: 0,
    lastRunStatus: 'unknown',
  });

  useEffect(() => {
    loadQAData();
  }, []);

  const loadQAData = async () => {
    setLoading(true);
    try {
      // Load test runs
      const { data: runs, error: runsError } = await supabase
        .from('qa_test_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(30);

      if (runsError) throw runsError;
      setTestRuns(runs || []);

      // Load latest test results
      if (runs && runs.length > 0) {
        const { data: results, error: resultsError } = await supabase
          .from('qa_test_results')
          .select('*')
          .eq('run_id', runs[0].id)
          .order('created_at', { ascending: false });

        if (resultsError) throw resultsError;
        setLatestResults(results || []);
      }

      // Load sync logs
      const { data: logs, error: logsError } = await supabase
        .from('regulation_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      setSyncLogs(logs || []);

      // Calculate stats
      if (runs && runs.length > 0) {
        const totalRuns = runs.length;
        const avgPassRate = runs.reduce((acc, run) => acc + (run.passed / run.total_tests), 0) / totalRuns;
        const avgLatency = runs.reduce((acc, run) => acc + (run.avg_latency_ms || 0), 0) / totalRuns;
        const lastRunStatus = runs[0].failed === 0 ? 'pass' : 'fail';

        setStats({
          totalRuns,
          avgPassRate: Math.round(avgPassRate * 100),
          avgLatency: Math.round(avgLatency),
          lastRunStatus,
        });
      }
    } catch (error) {
      console.error('Error loading QA data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QA data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runRegressionTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-regression-tests', {
        body: { triggered_by: 'manual' },
      });

      if (error) throw error;

      toast({
        title: 'Regression Tests Started',
        description: `Running ${data.total_tests} tests...`,
      });

      // Reload data after a delay
      setTimeout(loadQAData, 3000);
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: 'Error',
        description: 'Failed to start regression tests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const syncRegulations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-regulations', {
        body: {},
      });

      if (error) throw error;

      toast({
        title: 'Regulation Sync Started',
        description: 'Syncing regulations from official sources...',
      });

      setTimeout(loadQAData, 3000);
    } catch (error) {
      console.error('Error syncing regulations:', error);
      toast({
        title: 'Error',
        description: 'Failed to start regulation sync',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = testRuns.slice(0, 15).reverse().map((run) => ({
    date: new Date(run.started_at).toLocaleDateString(),
    passRate: Math.round((run.passed / run.total_tests) * 100),
    latency: run.avg_latency_ms || 0,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QA & Regression Dashboard</h1>
            <p className="text-muted-foreground">Automated testing and regulation sync monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runRegressionTests} disabled={loading}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Tests Now
            </Button>
            <Button onClick={syncRegulations} variant="outline" disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Regulations
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {stats.avgPassRate}%
                {stats.avgPassRate >= 95 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">Target: 95%+</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground">Target: &lt;5000ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Run Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stats.lastRunStatus === 'pass' ? 'default' : 'destructive'}>
                {stats.lastRunStatus === 'pass' ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {stats.lastRunStatus.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pass Rate Trend (Last 15 Runs)</CardTitle>
              <CardDescription>Monitor test success rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passRate" stroke="#22c55e" name="Pass Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latency Trend</CardTitle>
              <CardDescription>Average response time per test run</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="latency" fill="#3b82f6" name="Latency (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Latest Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Test Results</CardTitle>
            <CardDescription>Individual module test outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latestResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'pass' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.module}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Latency</p>
                      <p className="font-medium">{result.latency_ms}ms</p>
                    </div>
                    <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regulation Sync Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Regulation Syncs</CardTitle>
            <CardDescription>Track regulation updates from official sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{log.regulation_type}</p>
                    <p className="text-sm text-muted-foreground">{log.source_url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Chunks Created</p>
                      <p className="font-medium">{log.chunks_created || 0}</p>
                    </div>
                    <Badge
                      variant={
                        log.status === 'completed'
                          ? 'default'
                          : log.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {log.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
