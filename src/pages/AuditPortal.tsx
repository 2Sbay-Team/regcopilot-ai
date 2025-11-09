import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle2, XCircle, Clock, FileCheck, Download, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ConformityReport {
  id: string;
  organization_id: string;
  ai_system_id: string;
  report_type: string;
  risk_category: string;
  compliance_status: string;
  generated_at: string;
  signed_hash: string;
  version: number;
  organizations: {
    name: string;
    country_code: string;
  };
  ai_systems: {
    name: string;
    purpose: string;
  };
}

interface AuditorSignoff {
  id: string;
  decision: string;
  review_notes: string;
  compliance_score: number;
  evidence_coverage_score: number;
  signature_timestamp: string;
}

export default function AuditPortal() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ConformityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [signoffData, setSignoffData] = useState({
    decision: 'approved' as 'approved' | 'rejected' | 'needs_revision',
    review_notes: '',
    compliance_score: 85,
    evidence_coverage_score: 90,
  });
  const [existingSignoffs, setExistingSignoffs] = useState<AuditorSignoff[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Check if user has auditor role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasAuditorRole = roles?.some(r => r.role === 'auditor');
      if (!hasAuditorRole) {
        toast({
          title: "Access Denied",
          description: "You need auditor privileges to access this portal.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // Load conformity reports
      const { data: reportsData, error } = await supabase
        .from('ai_conformity_reports')
        .select(`
          *,
          organizations (name, country_code),
          ai_systems (name, purpose)
        `)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(reportsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetails = async (reportId: string) => {
    try {
      // Load evidence
      const { data: evidenceData } = await supabase
        .from('compliance_evidence_links')
        .select('*')
        .eq('report_id', reportId);
      
      setEvidence(evidenceData || []);

      // Load existing signoffs
      const { data: signoffsData } = await supabase
        .from('auditor_signoffs')
        .select('*')
        .eq('report_id', reportId);
      
      setExistingSignoffs(signoffsData || []);
    } catch (error: any) {
      console.error('Error loading report details:', error);
    }
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    loadReportDetails(reportId);
  };

  const handleSubmitSignoff = async () => {
    if (!selectedReport) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const report = reports.find(r => r.id === selectedReport);
      if (!report) throw new Error('Report not found');

      // Generate signature hash
      const signatureData = `${selectedReport}:${signoffData.decision}:${user.id}:${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase.from('auditor_signoffs').insert({
        report_id: selectedReport,
        auditor_id: user.id,
        organization_id: report.organization_id,
        decision: signoffData.decision,
        review_notes: signoffData.review_notes,
        compliance_score: signoffData.compliance_score,
        evidence_coverage_score: signoffData.evidence_coverage_score,
        signed_hash: signedHash,
        signature_timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      // Update report status based on decision
      let newStatus = report.compliance_status;
      if (signoffData.decision === 'approved') {
        newStatus = 'approved';
      } else if (signoffData.decision === 'rejected') {
        newStatus = 'rejected';
      }

      await supabase
        .from('ai_conformity_reports')
        .update({ compliance_status: newStatus })
        .eq('id', selectedReport);

      toast({
        title: "Sign-off Submitted",
        description: "Your audit decision has been recorded.",
      });

      loadReports();
      loadReportDetails(selectedReport);
      setSignoffData({
        decision: 'approved',
        review_notes: '',
        compliance_score: 85,
        evidence_coverage_score: 90,
      });
    } catch (error: any) {
      toast({
        title: "Error submitting sign-off",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('export-conformity', {
        body: { report_id: reportId, format: 'json-ld', include_evidence: true },
      });

      if (error) throw error;

      // Download as file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/ld+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conformity-${reportId}.jsonld`;
      a.click();

      toast({
        title: "Report Exported",
        description: "Conformity report downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'submitted': return <Clock className="h-4 w-4 text-warning" />;
      default: return <FileCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      approved: 'default',
      rejected: 'destructive',
      submitted: 'secondary',
      draft: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const colors: any = {
      high: 'destructive',
      limited: 'secondary',
      minimal: 'default',
    };
    return <Badge variant={colors[risk] || 'outline'}>{risk}</Badge>;
  };

  const selectedReportData = reports.find(r => r.id === selectedReport);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Auditor Portal</h1>
              <p className="text-muted-foreground">EU AI Act Conformity Assessment & Certification</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {reports.filter(r => r.compliance_status === 'submitted').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {reports.filter(r => r.compliance_status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {reports.filter(r => r.compliance_status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Conformity Reports</CardTitle>
              <CardDescription>Select a report to review and certify</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card
                      key={report.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedReport === report.id ? 'border-primary' : ''
                      }`}
                      onClick={() => handleReportSelect(report.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{report.ai_systems?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {report.organizations?.name}
                              </p>
                            </div>
                            {getStatusIcon(report.compliance_status)}
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(report.compliance_status)}
                            {getRiskBadge(report.risk_category)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Generated: {new Date(report.generated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedReportData && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Sign-off</CardTitle>
                <CardDescription>
                  {selectedReportData.ai_systems?.name} - Version {selectedReportData.version}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="signoff">Sign-off</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">AI System Information</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Purpose:</span> {selectedReportData.ai_systems?.purpose}</p>
                        <p><span className="text-muted-foreground">Risk Category:</span> {selectedReportData.risk_category}</p>
                        <p><span className="text-muted-foreground">Report Type:</span> {selectedReportData.report_type}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold">Cryptographic Verification</h4>
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">Signature Hash:</p>
                        <code className="block p-2 bg-muted rounded text-xs break-all">
                          {selectedReportData.signed_hash}
                        </code>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleExportReport(selectedReportData.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON-LD
                    </Button>
                  </TabsContent>

                  <TabsContent value="evidence" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {evidence.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>No evidence links found</p>
                          </div>
                        )}
                        {evidence.map((e) => (
                          <Card key={e.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{e.evidence_type}</span>
                                  {e.verified ? (
                                    <Badge variant="default">Verified</Badge>
                                  ) : (
                                    <Badge variant="outline">Unverified</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Category: {e.evidence_category || 'N/A'}
                                </p>
                                {e.requirement_code && (
                                  <p className="text-xs text-muted-foreground">
                                    Requirement: {e.requirement_code}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="signoff" className="space-y-4 mt-4">
                    {existingSignoffs.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold text-sm">Previous Sign-offs</h4>
                        {existingSignoffs.map((s) => (
                          <Card key={s.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <Badge>{s.decision}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(s.signature_timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-2">Score: {s.compliance_score}/100</p>
                            </CardContent>
                          </Card>
                        ))}
                        <Separator className="my-4" />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Decision</label>
                        <Select
                          value={signoffData.decision}
                          onValueChange={(value: any) =>
                            setSignoffData({ ...signoffData, decision: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="needs_revision">Needs Revision</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Review Notes</label>
                        <Textarea
                          value={signoffData.review_notes}
                          onChange={(e) =>
                            setSignoffData({ ...signoffData, review_notes: e.target.value })
                          }
                          placeholder="Enter your review comments..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Compliance Score</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={signoffData.compliance_score}
                            onChange={(e) =>
                              setSignoffData({
                                ...signoffData,
                                compliance_score: parseInt(e.target.value),
                              })
                            }
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Evidence Coverage</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={signoffData.evidence_coverage_score}
                            onChange={(e) =>
                              setSignoffData({
                                ...signoffData,
                                evidence_coverage_score: parseInt(e.target.value),
                              })
                            }
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <Button onClick={handleSubmitSignoff} className="w-full">
                        Submit Digital Sign-off
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}