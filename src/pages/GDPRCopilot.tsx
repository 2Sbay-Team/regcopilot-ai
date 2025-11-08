import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileCheck, ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

const GDPRCopilot = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [documents, setDocuments] = useState("")
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
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setProfile(profileData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke("gdpr-checker", {
        body: {
          org_id: profile?.organization_id,
          payload: {
            documents: [documents],
          },
        },
      })

      if (error) throw error
      setResult(data)
      toast({
        title: "GDPR Check Complete",
        description: `Found ${data.violations.length} violations`,
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Check Failed", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <FileCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">GDPR Checker</h1>
            <p className="text-sm text-muted-foreground">Scan for personal data & compliance issues</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Input</CardTitle>
              <CardDescription>Paste documents or agreements to scan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documents">Documents *</Label>
                  <Textarea
                    id="documents"
                    value={documents}
                    onChange={(e) => setDocuments(e.target.value)}
                    placeholder="Paste employee data, vendor agreements, or other documents..."
                    required
                    disabled={loading}
                    rows={10}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : <><FileCheck className="mr-2 h-4 w-4" />Run GDPR Check</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {result && (
              <>
                {result.violations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Violations Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.violations.map((v: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-destructive pl-3">
                          <Badge variant="destructive">{v.article}</Badge>
                          <p className="text-sm mt-1">{v.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {result.findings.map((f: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm">{f.category}</p>
                          <Badge variant={f.severity === "high" ? "destructive" : "default"}>{f.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GDPRCopilot
