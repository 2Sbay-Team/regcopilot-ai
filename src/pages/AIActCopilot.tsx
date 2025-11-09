import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, Loader2, HelpCircle, BookOpen, Plus, FileText, Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { DocumentUploadSection } from "@/components/DocumentUploadSection"
import { ModuleLayout } from "@/components/ModuleLayout"

const AIActCopilot = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [uploadEnabled, setUploadEnabled] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    sector: "",
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { language } = useLanguage()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate("/login")
      return
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(profileData)

    // Check upload policy
    const { data: policy } = await supabase
      .from("upload_policies")
      .select("ai_act_enabled")
      .eq("organization_id", profileData?.organization_id)
      .single()

    setUploadEnabled(policy?.ai_act_enabled ?? true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke("ai-act-auditor", {
        body: {
          org_id: profile?.organization_id,
          system: formData,
        },
      })

      if (error) throw error

      setResult(data)
      toast({
        title: t('aiact.assessmentComplete', language),
        description: `${t('aiact.assessmentCompleteDesc', language)} ${data.risk_class}`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('aiact.assessmentFailed', language),
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentAnalysis = (extractedData: any) => {
    // Auto-fill form fields from document analysis
    setFormData(prev => ({
      ...prev,
      name: extractedData.system_name || prev.name,
      purpose: extractedData.purpose || prev.purpose,
      sector: extractedData.sector || prev.sector,
    }))

    toast({
      title: "Fields Pre-filled",
      description: "Form fields have been populated from document analysis",
    })
  }

  return (
    <ModuleLayout
      title={
        <div className="flex items-center gap-2">
          {t('aiact.title', language)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="font-semibold">EU AI Act (European Union Artificial Intelligence Act)</p>
                <p className="mt-1">Regulation (EU) 2024/1689 - The world's first comprehensive legal framework for artificial intelligence, establishing risk-based requirements for AI systems in the European Union.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      }
      description={t('aiact.subtitle', language)}
      quickActions={[
        {
          label: "Berichte ansehen",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => navigate("/reports"),
          variant: "outline"
        },
        {
          label: "Export",
          icon: <Download className="h-4 w-4" />,
          onClick: () => navigate("/export-conformity"),
          variant: "outline"
        }
      ]}
    >
      <div className="max-w-4xl space-y-6">
        {/* Help Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('aiact.howToUse', language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>{t('aiact.systemName', language)}:</strong> {t('aiact.systemNameHelp', language)}
            </div>
            <div>
              <strong>{t('aiact.purpose', language)}:</strong> {t('aiact.purposeHelp', language)}
            </div>
            <div>
              <strong>{t('aiact.sector', language)}:</strong> {t('aiact.sectorHelp', language)}
            </div>
            <p className="text-muted-foreground mt-2">
              ℹ️ {t('aiact.analysisInfo', language)}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column: Upload + Form */}
          <div className="space-y-6">
            {uploadEnabled && profile?.organization_id ? (
              <DocumentUploadSection
                docType="ai_act"
                organizationId={profile.organization_id}
                onAnalysisComplete={handleDocumentAnalysis}
                title="Upload Annex IV or System Docs"
                description="Upload PDFs/Docs to auto-extract AI system details."
              />
            ) : null}

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('aiact.formTitle', language)}</CardTitle>
                <CardDescription>
                  {t('aiact.formDescription', language)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <TooltipProvider>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="name">{t('aiact.systemName', language)} *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{t('aiact.systemNameTooltip', language)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('aiact.systemNamePlaceholder', language)}
                        required
                        disabled={loading}
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="purpose">{t('aiact.purpose', language)} *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{t('aiact.purposeTooltip', language)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder={t('aiact.purposePlaceholder', language)}
                        required
                        disabled={loading}
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('aiact.purposeHint', language)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="sector">{t('aiact.sector', language)} *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{t('aiact.sectorTooltip', language)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="sector"
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        placeholder={t('aiact.sectorPlaceholder', language)}
                        required
                        disabled={loading}
                        maxLength={100}
                      />
                      <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
                        <p className="font-semibold text-destructive">⚠️ {t('aiact.highRiskSectors', language)}</p>
                        <p>employment, biometric, law_enforcement, education, critical_infrastructure</p>
                        <p className="font-semibold text-yellow-600 mt-2">⚡ {t('aiact.limitedRiskSectors', language)}</p>
                        <p>chatbots, emotion_recognition, deepfake_generation</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('aiact.analyzing', language)}
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('aiact.runAssessment', language)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Results */}
          <div className="space-y-4">
            {result && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('aiact.riskClassification', language)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.risk_class === "high" ? "destructive" : "default"} className="text-lg py-1 px-3">
                        {result.risk_class.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{t('aiact.riskLevel', language)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('aiact.complianceSummary', language)}</CardTitle>
                    <CardDescription>{t('aiact.aiGenerated', language)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{result.report}</p>
                    </div>
                    {result.assessment_id && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/explainability?id=${result.assessment_id}&type=ai_act`)}
                      >
                        {t('aiact.viewExplainability', language)}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {result.citations && result.citations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('aiact.evidenceCitations', language)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.citations.map((citation: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-primary pl-3 text-sm">
                          <p className="font-semibold">{citation.source}</p>
                          <p className="text-muted-foreground">{citation.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && !loading && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('aiact.completeForm', language)}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ModuleLayout>
  )
}

export default AIActCopilot
