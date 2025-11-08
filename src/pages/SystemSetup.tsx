import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Database, CheckCircle2, Loader2, BookOpen, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const SystemSetup = () => {
  const [seeding, setSeeding] = useState(false)
  const [seedComplete, setSeedComplete] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)
  const navigate = useNavigate()
  const { toast } = useToast()

  const checkKnowledgeBase = async () => {
    try {
      const { count } = await supabase
        .from("document_chunks")
        .select("*", { count: "exact", head: true })

      setChunkCount(count || 0)
      setSeedComplete((count || 0) > 0)
    } catch (error: any) {
      console.error("Failed to check knowledge base:", error)
    }
  }

  useState(() => {
    checkKnowledgeBase()
  })

  const seedKnowledgeBase = async () => {
    setSeeding(true)
    try {
      const { data, error } = await supabase.functions.invoke("seed-regulations", {})

      if (error) throw error

      toast({
        title: "Knowledge Base Initialized",
        description: `Successfully seeded ${data.chunks_seeded} regulatory chunks`,
      })

      setSeedComplete(true)
      await checkKnowledgeBase()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message,
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">System Setup</h1>
            <p className="text-sm text-muted-foreground">Initialize compliance knowledge base</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert className="mb-6">
          <Database className="h-4 w-4" />
          <AlertTitle>Regulatory Knowledge Base</AlertTitle>
          <AlertDescription>
            Seed the system with EU AI Act, GDPR, and CSRD/ESRS regulatory documents for RAG-powered compliance analysis.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base Status
              </CardTitle>
              <CardDescription>
                Vector database for semantic search across regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Document Chunks</p>
                    <p className="text-sm text-muted-foreground">
                      Regulatory text segments with embeddings
                    </p>
                  </div>
                  <div className="text-right">
                    {seedComplete ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {chunkCount} chunks
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not initialized</Badge>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={seedKnowledgeBase} 
                  disabled={seeding}
                  className="w-full"
                  variant={seedComplete ? "outline" : "default"}
                >
                  {seeding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Seeding Knowledge Base...
                    </>
                  ) : seedComplete ? (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Re-seed Knowledge Base
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Initialize Knowledge Base
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Included Regulations</CardTitle>
              <CardDescription>
                Pre-configured compliance frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">EU AI Act 2024</p>
                    <p className="text-sm text-muted-foreground">
                      Risk classification, prohibited practices, high-risk requirements, Annex III & IV
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">GDPR (Regulation 2016/679)</p>
                    <p className="text-sm text-muted-foreground">
                      Data protection principles, lawfulness, cross-border transfers, Chapter V
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">CSRD/ESRS</p>
                    <p className="text-sm text-muted-foreground">
                      Climate change (E1), emissions reporting, workforce diversity (S1)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {seedComplete && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Setup Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Your compliance copilot is ready! You can now:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                  <li>Run AI Act audits with RAG-powered risk classification</li>
                  <li>Perform GDPR privacy scans with violation detection</li>
                  <li>Generate ESG/CSRD reports with completeness scoring</li>
                  <li>Search regulations using semantic vector search</li>
                  <li>View explainability and audit trails</li>
                </ul>
                <Button className="w-full mt-4" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemSetup
