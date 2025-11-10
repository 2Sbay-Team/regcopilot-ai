import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import {
  exportComplianceReportToPDF,
  formatAIActAssessmentForPDF,
  formatGDPRAssessmentForPDF,
  formatESGReportForPDF
} from "@/lib/pdfExport"

interface ExportReportButtonProps {
  reportType: 'ai-act' | 'gdpr' | 'esg'
  reportData: any
  organizationName: string
  className?: string
}

export const ExportReportButton = ({ 
  reportType, 
  reportData, 
  organizationName,
  className 
}: ExportReportButtonProps) => {
  const handleExport = () => {
    try {
      let formattedReport

      switch (reportType) {
        case 'ai-act':
          formattedReport = formatAIActAssessmentForPDF(reportData, organizationName)
          break
        case 'gdpr':
          formattedReport = formatGDPRAssessmentForPDF(reportData, organizationName)
          break
        case 'esg':
          formattedReport = formatESGReportForPDF(reportData, organizationName)
          break
        default:
          throw new Error('Unknown report type')
      }

      exportComplianceReportToPDF(formattedReport)
      
      toast.success('Report exported', {
        description: 'PDF report has been downloaded successfully.'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed', {
        description: 'Unable to export report. Please try again.'
      })
    }
  }

  return (
    <Button 
      onClick={handleExport}
      variant="outline"
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  )
}
