import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Brain, FileText, Link as LinkIcon } from "lucide-react"

const Explainability = () => {
  const [searchParams] = useSearchParams()
  const assessmentId = searchParams.get("id")
  const assessmentType = searchParams.get("type")
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<any>(null)
  const [explainability, setExplainability] = useState<any>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId && assessmentType) {
      loadData()
    }
  }, [assessmentId, assessmentType])

  const loadData = async () => {
    try {
      // Load assessment data based on type
      let assessmentData
      if (assessmentType === "ai_act") {
        const { data } = await supabase
          .from("ai_act_assessments")
          .select("*, ai_systems(*)")
          .eq("id", assessmentId)
          .single()
        assessmentData = data
      } else if (assessmentType === "gdpr") {
        const { data } = await supabase
          .from("gdpr_assessments")
          .select("*")
          .eq("id", assessmentId)
          .single()
        assessmentData = data
      } else if (assessmentType === "esg") {
        const { data } = await supabase
          .from("esg_reports")
          .select("*")
          .eq("id", assessmentId)
          .single()
        assessmentData = data
      }

      setAssessment(assessmentData)

      // Load explainability view if exists
      const { data: explainData } = await supabase
        .from("explainability_views")
        .select("*")
        .eq("assessment_id", assessmentId)
        .eq("assessment_type", assessmentType)
        .maybeSingle()

      setExplainability(explainData)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Assessment not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Explainability View</h1>
            <p className="text-sm text-muted-foreground">AI reasoning transparency</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="reasoning">Reasoning Chain</TabsTrigger>
            <TabsTrigger value="evidence">Evidence & Citations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assessment Overview</CardTitle>
                  <Badge>{assessmentType?.toUpperCase()}</Badge>
                </div>
                <CardDescription>
                  Created: {new Date(assessment.created_at || assessment.assessment_date).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentType === "ai_act" && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-1">AI System</h3>
                      <p className="text-sm text-muted-foreground">{assessment.ai_systems?.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Risk Category</h3>
                      <Badge variant={assessment.risk_category === "high" ? "destructive" : "default"}>
                        {assessment.risk_category}
                      </Badge>
                    </div>
                    {assessment.annex_iv_summary && (
                      <div>
                        <h3 className="font-semibold mb-1">Annex IV Summary</h3>
                        <p className="text-sm whitespace-pre-wrap">{assessment.annex_iv_summary}</p>
                      </div>
                    )}
                  </>
                )}

                {assessmentType === "gdpr" && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-1">Violations Detected</h3>
                      <p className="text-sm">{assessment.violations?.length || 0} violations found</p>
                    </div>
                    {assessment.summary && (
                      <div>
                        <h3 className="font-semibold mb-1">Summary</h3>
                        <p className="text-sm whitespace-pre-wrap">{assessment.summary}</p>
                      </div>
                    )}
                  </>
                )}

                {assessmentType === "esg" && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-1">Reporting Period</h3>
                      <p className="text-sm">{assessment.reporting_period}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Completeness Score</h3>
                      <p className="text-2xl font-bold">{assessment.completeness_score}%</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reasoning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Reasoning Chain
                </CardTitle>
                <CardDescription>
                  Step-by-step analysis performed by the compliance copilot
                </CardDescription>
              </CardHeader>
              <CardContent>
                {explainability?.reasoning_chain ? (
                  <div className="space-y-4">
                    {JSON.stringify(explainability.reasoning_chain, null, 2)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Detailed reasoning chain not available for this assessment.
                    Check audit logs for processing details.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Regulatory Evidence
                </CardTitle>
                <CardDescription>
                  Citations from regulatory documents used in this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {explainability?.evidence_chunks && explainability.evidence_chunks.length > 0 ? (
                  <div className="space-y-4">
                    {explainability.evidence_chunks.map((chunk: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{chunk.source || "Regulatory Document"}</Badge>
                          {chunk.section && (
                            <span className="text-xs text-muted-foreground">{chunk.section}</span>
                          )}
                        </div>
                        <p className="text-sm">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No evidence chunks available. This assessment may have been performed without RAG retrieval.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Related Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cross-assessment links coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Explainability
