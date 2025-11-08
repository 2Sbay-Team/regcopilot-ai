import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Download, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import jsPDF from "jspdf"

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [reportType, setReportType] = useState<string>("weekly")
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadReports()
    
    // Setup realtime subscription for new reports
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compliance_reports'
        },
        () => {
          loadReports()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("compliance_reports")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setReports(data || [])
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load reports", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single()

      if (!profile) throw new Error("Profile not found")

      // Calculate period dates based on report type
      const endDate = new Date()
      const startDate = new Date()
      
      if (reportType === "weekly") {
        startDate.setDate(endDate.getDate() - 7)
      } else if (reportType === "monthly") {
        startDate.setMonth(endDate.getMonth() - 1)
      } else if (reportType === "quarterly") {
        startDate.setMonth(endDate.getMonth() - 3)
      }

      const { data, error } = await supabase.functions.invoke('generate-compliance-report', {
        body: {
          organization_id: profile.organization_id,
          report_type: reportType,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
          user_id: user.id
        }
      })

      if (error) throw error

      toast({ 
        title: "Report generated successfully",
        description: `Your ${reportType} compliance report is ready`
      })
      
      setDialogOpen(false)
      await loadReports()
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Failed to generate report", 
        description: error.message 
      })
    } finally {
      setGenerating(false)
    }
  }

  const exportToPDF = async (report: any) => {
    try {
      const doc = new jsPDF()
      const summary = report.report_data.summary
      
      // Header
      doc.setFontSize(20)
      doc.text("Compliance Summary Report", 20, 20)
      
      doc.setFontSize(12)
      doc.text(`Report Type: ${report.report_type.toUpperCase()}`, 20, 30)
      doc.text(`Period: ${new Date(report.report_period_start).toLocaleDateString()} - ${new Date(report.report_period_end).toLocaleDateString()}`, 20, 37)
      doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 20, 44)
      doc.text(`Risk Score: ${report.report_data.risk_score}/100`, 20, 51)
      
      // AI Act Section
      let yPos = 65
      doc.setFontSize(14)
      doc.text("AI Act Compliance", 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`Total Assessments: ${summary.ai_act.total}`, 25, yPos)
      yPos += 6
      doc.text(`High Risk Systems: ${summary.ai_act.high_risk}`, 25, yPos)
      yPos += 6
      doc.text(`Limited Risk: ${summary.ai_act.limited_risk}`, 25, yPos)
      yPos += 6
      doc.text(`Minimal Risk: ${summary.ai_act.minimal_risk}`, 25, yPos)
      
      // GDPR Section
      yPos += 12
      doc.setFontSize(14)
      doc.text("GDPR Compliance", 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`Total Assessments: ${summary.gdpr.total}`, 25, yPos)
      yPos += 6
      doc.text(`Total Violations: ${summary.gdpr.violations}`, 25, yPos)
      
      if (Object.keys(summary.gdpr.by_article).length > 0) {
        yPos += 6
        doc.text("Violations by Article:", 25, yPos)
        Object.entries(summary.gdpr.by_article).forEach(([article, count]) => {
          yPos += 6
          if (yPos > 280) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`  ${article}: ${count}`, 30, yPos)
        })
      }
      
      // ESG Section
      yPos += 12
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text("ESG Reporting", 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`Total Reports: ${summary.esg.total}`, 25, yPos)
      yPos += 6
      doc.text(`Avg Completeness: ${summary.esg.avg_completeness.toFixed(1)}%`, 25, yPos)
      
      // Alerts Section
      yPos += 12
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text("Risk Alerts", 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`Total Alerts: ${summary.alerts.total}`, 25, yPos)
      yPos += 6
      doc.text(`Acknowledged: ${summary.alerts.acknowledged}`, 25, yPos)
      yPos += 6
      doc.text(`Unacknowledged: ${summary.alerts.unacknowledged}`, 25, yPos)
      
      // Activity Section
      yPos += 12
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text("System Activity", 20, yPos)
      doc.setFontSize(10)
      yPos += 7
      doc.text(`Total Actions: ${summary.activity.total_actions}`, 25, yPos)
      
      // Save PDF
      const fileName = `compliance-report-${report.report_type}-${report.report_period_end}.pdf`
      doc.save(fileName)
      
      toast({ title: "PDF exported successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to export PDF", description: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Compliance Reports</h1>
              <p className="text-sm text-muted-foreground">Generate and manage summary reports</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive compliance summary for stakeholder distribution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="adhoc">Ad-hoc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateReport} disabled={generating} className="w-full">
                  {generating ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports generated yet</h3>
              <p className="text-muted-foreground mb-4">Generate your first compliance report to get started</p>
              <Button onClick={() => setDialogOpen(true)}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                        <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                          {report.status === 'completed' ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Completed</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" />Pending</>
                          )}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.report_period_start).toLocaleDateString()} - {new Date(report.report_period_end).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Generated {new Date(report.generated_at).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF(report)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${report.report_data.risk_score > 50 ? 'text-destructive' : 'text-green-600'}`} />
                        <p className="text-2xl font-bold">{report.report_data.risk_score}/100</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">AI Act Assessments</p>
                      <p className="text-2xl font-bold">{report.report_data.summary.ai_act.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.report_data.summary.ai_act.high_risk} high risk
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">GDPR Violations</p>
                      <p className="text-2xl font-bold">{report.report_data.summary.gdpr.violations}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.report_data.summary.gdpr.total} assessments
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Active Alerts</p>
                      <p className="text-2xl font-bold">{report.report_data.summary.alerts.unacknowledged}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.report_data.summary.alerts.total} total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
