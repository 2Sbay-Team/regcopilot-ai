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
import { Shield, ArrowLeft, Loader2, ExternalLink } from "lucide-react"

const AIActCopilot = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    sector: "",
  })
  const navigate = useNavigate()
  const { toast } = useToast()

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
        title: "Assessment Complete",
        description: `AI system classified as ${data.risk_class} risk`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">AI Act Auditor</h1>
            <p className="text-sm text-muted-foreground">Automated risk classification & compliance</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>AI System Information</CardTitle>
              <CardDescription>
                Provide details about your AI system for risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">System Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="HR Screening AI"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Employment screening with CV parsing and candidate ranking"
                    required
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="employment, biometric, healthcare, etc."
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    High-risk: employment, biometric, law_enforcement, education, critical_infrastructure
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Run Assessment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {result && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Classification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.risk_class === "high" ? "destructive" : "default"} className="text-lg py-1 px-3">
                        {result.risk_class.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Summary</CardTitle>
                    <CardDescription>AI-generated analysis</CardDescription>
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
                        View Explainability
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {result.citations && result.citations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Evidence & Citations</CardTitle>
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
                  <p>Complete the form to run your AI Act assessment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIActCopilot
