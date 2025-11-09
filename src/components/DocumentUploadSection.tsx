import { useState } from "react"
import { Upload, FileText, Loader2, CheckCircle2, XCircle, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

interface DocumentUploadSectionProps {
  docType: 'ai_act' | 'gdpr' | 'esg'
  organizationId: string
  onAnalysisComplete?: (data: any) => void
  title?: string
  description?: string
}

export const DocumentUploadSection = ({
  docType,
  organizationId,
  onAnalysisComplete,
  title = "Upload Document",
  description = "Upload a document for automatic analysis and field pre-filling"
}: DocumentUploadSectionProps) => {
  const { toast } = useToast()
  const { language } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'completed' | 'error'>('idle')
  const [extractedSummary, setExtractedSummary] = useState<string>('')

  const bucketMap = {
    ai_act: 'ai-act-documents',
    gdpr: 'gdpr-documents',
    esg: 'esg-documents',
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (500MB limit for large documents)
      const maxSizeBytes = 500 * 1024 * 1024 // 500MB
      if (selectedFile.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: "Maximum file size is 500MB. For larger files, please contact support.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setStatus('idle')
      setProgress(0)
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file) return

    setUploading(true)
    setStatus('uploading')
    setProgress(10)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload file to storage
      const fileName = `${organizationId}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from(bucketMap[docType])
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setProgress(30)

      // Create document record
      const { data: docRecord, error: docError } = await supabase
        .from('uploaded_documents')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          doc_type: docType,
          status: 'pending',
          file_size_bytes: file.size,
        })
        .select()
        .single()

      if (docError) throw docError

      setDocumentId(docRecord.id)
      setProgress(50)
      setUploading(false)
      setAnalyzing(true)
      setStatus('analyzing')

      // Trigger analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-uploaded-doc',
        {
          body: {
            document_id: docRecord.id,
            file_path: fileName,
            doc_type: docType,
          },
        }
      )

      if (analysisError) throw analysisError

      setProgress(100)
      setStatus('completed')
      setExtractedSummary(analysisData.extracted_data?.summary || 'Analysis completed')

      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed successfully",
      })

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData.extracted_data)
      }
    } catch (error: any) {
      console.error('Upload/analysis error:', error)
      setStatus('error')
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading...</Badge>
      case 'analyzing':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Analyzing...</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        {/* Privacy Notice */}
        <Alert className="bg-primary/5 border-primary/20">
          <Lock className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>{t('upload.privacyTitle', language)}</strong>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('upload.privacyDesc', language)}
            </p>
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {t('upload.maxFileSize', language)}: 500MB • {t('upload.supportedFormats', language)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            id={`file-upload-${docType}`}
            className="hidden"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
            onChange={handleFileSelect}
            disabled={uploading || analyzing}
          />
          <label htmlFor={`file-upload-${docType}`}>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={uploading || analyzing}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </Button>
          </label>

          {file && (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <Button
                onClick={handleUploadAndAnalyze}
                disabled={uploading || analyzing}
              >
                {uploading || analyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Analyze Document
              </Button>
            </div>
          )}
        </div>

        {(uploading || analyzing || status === 'completed') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {getStatusBadge()}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {status === 'completed' && extractedSummary && (
          <div className="bg-accent/20 p-4 rounded-lg border border-accent/30">
            <h4 className="font-medium mb-2">Analysis Summary</h4>
            <p className="text-sm text-muted-foreground">{extractedSummary}</p>
          </div>
        )}
      </div>
    </Card>
  )
}