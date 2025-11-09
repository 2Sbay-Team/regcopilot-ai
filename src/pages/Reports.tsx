import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Plus, Clock, CheckCircle, Loader2, Calendar } from "lucide-react"
import { format } from "date-fns"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const Reports = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for report generation
  const [periodStart, setPeriodStart] = useState(
    format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd')
  )
  const [periodEnd, setPeriodEnd] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadReports()
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

  const loadReports = async () => {
    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('generated_at', { ascending: false })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
      return
    }

    setReports(data || [])
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-unified-report', {
        body: {
          organization_id: profile.organization_id,
          period_start: periodStart,
          period_end: periodEnd,
          report_type: 'unified'
        }
      })

      if (error) throw error

      toast({
        title: "Report Generated",
        description: "Your unified compliance report is ready"
      })

      setIsDialogOpen(false)
      loadReports()

      // Auto-download the report
      if (data.html_content) {
        downloadReportAsPDF(data.html_content, data.report_id)
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report"
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadReportAsPDF = async (htmlContent: string, reportId: string) => {
    try {
      // Create a temporary container
      const container = document.createElement('div')
      container.innerHTML = htmlContent
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.width = '800px'
      document.body.appendChild(container)

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
      })

      // Remove temporary container
      document.body.removeChild(container)

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= 297 // A4 height in mm

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        )
        heightLeft -= 297
      }

      // Download
      pdf.save(`compliance-report-${reportId}.pdf`)

      toast({
        title: "Downloaded",
        description: "PDF report saved to your downloads"
      })
    } catch (error: any) {
      console.error('PDF generation error:', error)
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Failed to generate PDF. Please try again."
      })
    }
  }

  const downloadExistingReport = async (report: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-unified-report', {
        body: {
          organization_id: report.organization_id,
          period_start: report.report_period_start,
          period_end: report.report_period_end,
          report_type: report.report_type
        }
      })

      if (error) throw error

      if (data.html_content) {
        downloadReportAsPDF(data.html_content, report.id)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Compliance Reports
          </h1>
          <p className="text-muted-foreground font-medium">
            Generate and download unified compliance reports across all modules
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Unified Compliance Report</DialogTitle>
              <DialogDescription>
                Combine insights from AI Act, GDPR, and ESG modules into a single PDF
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period_start">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Period Start
                </Label>
                <Input
                  id="period_start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period_end">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Period End
                </Label>
                <Input
                  id="period_end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Report Will Include:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ All AI Act risk assessments</li>
                  <li>✓ GDPR compliance violations</li>
                  <li>✓ ESG sustainability metrics</li>
                  <li>✓ Executive summary with KPIs</li>
                </ul>
              </div>
            </div>

            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </>
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generated Reports
          </CardTitle>
          <CardDescription>
            Download previously generated compliance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium capitalize">
                      {report.report_type || 'Unified'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.report_period_start), 'MMM dd, yyyy')} - {' '}
                      {format(new Date(report.report_period_end), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.generated_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadExistingReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Click "Generate Report" to create your first compliance report</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports