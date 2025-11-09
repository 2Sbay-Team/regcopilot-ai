import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, Lock, Database, Cpu, FileCode, HardDrive } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SecurityTest {
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  remediation?: string;
  compliance_mapping?: string[];
}

interface SecuritySummary {
  total_tests: number;
  passed: number;
  failed: number;
  warnings: number;
  critical_failures: number;
  high_failures: number;
}

export default function SecurityCenter() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [results, setResults] = useState<SecurityTest[]>([]);
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const runSecurityAudit = async (testType: string = 'full') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-audit', {
        body: { test_type: testType }
      });

      if (error) throw error;

      setSummary(data.summary);
      setResults(data.results);
      setLastAuditTime(data.timestamp);
      
      toast.success(`Security audit completed: ${data.summary.passed} passed, ${data.summary.failed} failed`);
    } catch (error: any) {
      console.error('Security audit error:', error);
      toast.error(`Audit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = {
      summary,
      results,
      timestamp: lastAuditTime,
      generated_by: 'RegSense Advisor Security Center'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Security report exported');
  };

  const categories = ["all", "Database Security", "Injection Protection", "AI Security", "Automation Security", "Storage Security"];

  const filteredResults = selectedCategory === "all" 
    ? results 
    : results.filter(r => r.category === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'fail': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database Security': return <Database className="h-4 w-4" />;
      case 'Injection Protection': return <Shield className="h-4 w-4" />;
      case 'AI Security': return <Cpu className="h-4 w-4" />;
      case 'Automation Security': return <FileCode className="h-4 w-4" />;
      case 'Storage Security': return <HardDrive className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const overallScore = summary 
    ? Math.round((summary.passed / summary.total_tests) * 100)
    : 0;

  // Calculate severity breakdowns
  const getSeverityBreakdown = () => {
    if (!results.length) return null;

    const breakdown = {
      critical: { passed: 0, failed: 0, warnings: 0, total: 0 },
      high: { passed: 0, failed: 0, warnings: 0, total: 0 },
      medium: { passed: 0, failed: 0, warnings: 0, total: 0 },
      low: { passed: 0, failed: 0, warnings: 0, total: 0 }
    };

    results.forEach(test => {
      const severity = test.severity;
      breakdown[severity].total++;
      
      if (test.status === 'pass') {
        breakdown[severity].passed++;
      } else if (test.status === 'fail') {
        breakdown[severity].failed++;
      } else if (test.status === 'warning') {
        breakdown[severity].warnings++;
      }
    });

    return breakdown;
  };

  const severityBreakdown = getSeverityBreakdown();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Security Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive security testing & compliance verification
          </p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
          <Button onClick={() => runSecurityAudit('full')} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running Audit...' : 'Run Full Audit'}
          </Button>
        </div>
      </div>

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallScore}%</div>
                <Progress value={overallScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.passed} of {summary.total_tests} tests passed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {summary.critical_failures}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {summary.high_failures}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Should be addressed soon
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {summary.warnings}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended improvements
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Severity Breakdown Cards */}
          {severityBreakdown && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Critical Severity */}
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    Critical Severity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total Tests</span>
                      <span className="text-sm font-medium">{severityBreakdown.critical.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Passed
                      </span>
                      <span className="text-sm font-medium text-green-600">{severityBreakdown.critical.passed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Failed
                      </span>
                      <span className="text-sm font-medium text-red-600">{severityBreakdown.critical.failed}</span>
                    </div>
                    {severityBreakdown.critical.warnings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Warnings
                        </span>
                        <span className="text-sm font-medium text-yellow-600">{severityBreakdown.critical.warnings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* High Severity */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    High Severity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total Tests</span>
                      <span className="text-sm font-medium">{severityBreakdown.high.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Passed
                      </span>
                      <span className="text-sm font-medium text-green-600">{severityBreakdown.high.passed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Failed
                      </span>
                      <span className="text-sm font-medium text-red-600">{severityBreakdown.high.failed}</span>
                    </div>
                    {severityBreakdown.high.warnings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Warnings
                        </span>
                        <span className="text-sm font-medium text-yellow-600">{severityBreakdown.high.warnings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medium Severity */}
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    Medium Severity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total Tests</span>
                      <span className="text-sm font-medium">{severityBreakdown.medium.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Passed
                      </span>
                      <span className="text-sm font-medium text-green-600">{severityBreakdown.medium.passed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Failed
                      </span>
                      <span className="text-sm font-medium text-red-600">{severityBreakdown.medium.failed}</span>
                    </div>
                    {severityBreakdown.medium.warnings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Warnings
                        </span>
                        <span className="text-sm font-medium text-yellow-600">{severityBreakdown.medium.warnings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Low Severity */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    Low Severity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total Tests</span>
                      <span className="text-sm font-medium">{severityBreakdown.low.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Passed
                      </span>
                      <span className="text-sm font-medium text-green-600">{severityBreakdown.low.passed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        Failed
                      </span>
                      <span className="text-sm font-medium text-red-600">{severityBreakdown.low.failed}</span>
                    </div>
                    {severityBreakdown.low.warnings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Warnings
                        </span>
                        <span className="text-sm font-medium text-yellow-600">{severityBreakdown.low.warnings}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Test Categories</CardTitle>
              <CardDescription>
                Run targeted security tests or view results by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSecurityAudit('database')}
                  disabled={loading}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSecurityAudit('injection')}
                  disabled={loading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Injection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSecurityAudit('ai')}
                  disabled={loading}
                >
                  <Cpu className="h-4 w-4 mr-2" />
                  AI Security
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSecurityAudit('automation')}
                  disabled={loading}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Automation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSecurityAudit('storage')}
                  disabled={loading}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed security test outcomes - Last run: {lastAuditTime ? new Date(lastAuditTime).toLocaleString() : 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="mb-4">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat}>
                    {cat === "all" ? "All Tests" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-3">
                {filteredResults.map((test, idx) => (
                  <Card key={idx} className="border-l-4" style={{
                    borderLeftColor: test.status === 'pass' ? 'hsl(var(--success))' : 
                                    test.status === 'fail' ? 'hsl(var(--destructive))' : 
                                    'hsl(var(--warning))'
                  }}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getCategoryIcon(test.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(test.status)}
                              <h4 className="font-medium">{test.name}</h4>
                              {/* Only show severity badge for failures and warnings */}
                              {test.status !== 'pass' && (
                                <Badge variant={getSeverityColor(test.severity) as any}>
                                  {test.severity.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {test.message}
                            </p>
                            {test.remediation && (
                              <div className="bg-muted p-2 rounded text-sm mt-2">
                                <strong>Remediation:</strong> {test.remediation}
                              </div>
                            )}
                            {test.compliance_mapping && test.compliance_mapping.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {test.compliance_mapping.map((c, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!summary && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Audit Results Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Run a security audit to assess your platform's security posture
            </p>
            <Button onClick={() => runSecurityAudit('full')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Run First Audit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
