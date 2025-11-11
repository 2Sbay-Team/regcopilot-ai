import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, Play, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationResult {
  module: string;
  test: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  duration?: number;
  message?: string;
  data?: any;
}

export function ESGVerificationDashboard() {
  const { toast } = useToast();
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);

  const totalTests = 20;
  const passedTests = results.filter((r) => r.status === 'passed').length;
  const failedTests = results.filter((r) => r.status === 'failed').length;
  const passRate = results.length > 0 ? (passedTests / results.length) * 100 : 0;

  async function runTest(module: string, test: string, fn: () => Promise<void>): Promise<void> {
    setCurrentTest(`${module}: ${test}`);
    const startTime = Date.now();

    try {
      await fn();
      const duration = Date.now() - startTime;
      setResults((prev) => [...prev, { module, test, status: 'passed', duration }]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setResults((prev) => [
        ...prev,
        { module, test, status: 'failed', duration, message: error.message },
      ]);
    }

    setProgress((prev) => prev + (100 / totalTests));
  }

  async function runFullVerification() {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      // Part 1: Data Ingestion
      await runTest('Ingestion', 'Demo Seed Load', async () => {
        const { data, error } = await supabase.functions.invoke('demo-seed-ingestion');
        if (error) throw error;
        if (!data.success) throw new Error('Demo seed failed');
      });

      await runTest('Ingestion', 'Staging Data', async () => {
        const { count, error } = await supabase
          .from('staging_rows')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        if (!count || count < 60) throw new Error(`Insufficient rows: ${count}`);
      });

      await runTest('Ingestion', 'Schema Cache', async () => {
        const { count, error } = await supabase
          .from('source_schema_cache')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        if (!count || count < 20) throw new Error(`Insufficient entries: ${count}`);
      });

      // Part 2: Mapping
      await runTest('Mapping', 'Suggest Mapping', async () => {
        const { data, error } = await supabase.functions.invoke('mapping-suggest');
        if (error) throw error;
        if (!data.profile_id) throw new Error('No profile ID');
      });

      await runTest('Mapping', 'Execute Mapping', async () => {
        const { data: profiles } = await supabase
          .from('mapping_profiles')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!profiles?.[0]) throw new Error('No profiles found');

        const { data, error } = await supabase.functions.invoke('run-mapping', {
          body: { profile_id: profiles[0].id },
        });
        if (error) throw error;
        if (!data.success) throw new Error('Mapping failed');
      });

      // Part 3: KPI Evaluation
      await runTest('KPI', 'Evaluate KPIs', async () => {
        const { data, error } = await supabase.functions.invoke('kpi-evaluate');
        if (error) throw error;
        if (!data.success) throw new Error('KPI evaluation failed');
      });

      await runTest('KPI', 'Verify Results', async () => {
        const { count, error } = await supabase
          .from('esg_kpi_results')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        if (!count || count < 10) throw new Error(`Insufficient KPIs: ${count}`);
      });

      // Part 4: Data Quality
      await runTest('Quality', 'Unit Normalization', async () => {
        const { data, error } = await supabase
          .from('esg_kpi_results')
          .select('metric_code, unit')
          .ilike('metric_code', 'E1-%')
          .limit(100);
        if (error) throw error;

        for (const row of data || []) {
          if (
            (row.metric_code.includes('scope') || row.metric_code.includes('total')) &&
            row.unit !== 'tonnes CO2e'
          ) {
            throw new Error(`Invalid unit for ${row.metric_code}: ${row.unit}`);
          }
        }
      });

      await runTest('Quality', 'Value Plausibility', async () => {
        const { data, error } = await supabase
          .from('esg_kpi_results')
          .select('metric_code, value')
          .ilike('metric_code', '%scope%')
          .limit(100);
        if (error) throw error;

        for (const row of data || []) {
          if (row.value < 0) {
            throw new Error(`Negative value: ${row.metric_code}`);
          }
        }
      });

      await runTest('Quality', 'Data Lineage', async () => {
        const { count, error } = await supabase
          .from('data_lineage_edges')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        if (!count || count < 5) throw new Error(`Insufficient lineage: ${count}`);
      });

      await runTest('Quality', 'Audit Chain', async () => {
        const { data, error } = await supabase
          .from('esg_ingestion_audit')
          .select('*')
          .order('occurred_at', { ascending: true })
          .limit(10);
        if (error) throw error;

        for (let i = 1; i < (data?.length || 0); i++) {
          if (data![i].prev_hash && data![i - 1].output_hash) {
            if (data![i].prev_hash !== data![i - 1].output_hash) {
              throw new Error('Hash chain broken');
            }
          }
        }
      });

      setProgress(100);
      toast({
        title: 'Verification Complete',
        description: `${passedTests} passed, ${failedTests} failed`,
      });
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }

  function downloadReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: { totalTests: results.length, passedTests, failedTests, passRate },
      results,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esg-verification-${Date.now()}.json`;
    a.click();
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.module]) acc[result.module] = [];
    acc[result.module].push(result);
    return acc;
  }, {} as Record<string, VerificationResult[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">ESG Platform Verification</h2>
          <p className="text-muted-foreground">End-to-end technical QA & validation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runFullVerification} disabled={isRunning}>
            {isRunning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? 'Running...' : 'Run Verification'}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Running Tests...</CardTitle>
            <CardDescription>{currentTest}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="passed">Passed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {Object.entries(groupedResults).map(([module, moduleResults]) => (
                <Card key={module}>
                  <CardHeader>
                    <CardTitle>{module}</CardTitle>
                    <CardDescription>
                      {moduleResults.filter((r) => r.status === 'passed').length} /{' '}
                      {moduleResults.length} passed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {moduleResults.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            {result.status === 'passed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {result.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                            {result.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                            <span className="text-sm">{result.test}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                              {result.status}
                            </Badge>
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="passed" className="space-y-4">
              {Object.entries(groupedResults).map(([module, moduleResults]) => {
                const passed = moduleResults.filter((r) => r.status === 'passed');
                if (passed.length === 0) return null;
                return (
                  <Card key={module}>
                    <CardHeader>
                      <CardTitle>{module}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {passed.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{result.test}</span>
                            </div>
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {Object.entries(groupedResults).map(([module, moduleResults]) => {
                const failed = moduleResults.filter((r) => r.status === 'failed');
                if (failed.length === 0) return null;
                return (
                  <Card key={module}>
                    <CardHeader>
                      <CardTitle>{module}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {failed.map((result, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-red-200 bg-red-50">
                            <div className="flex items-center gap-2 mb-1">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium">{result.test}</span>
                            </div>
                            {result.message && (
                              <p className="text-xs text-red-600 ml-6">{result.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
