import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertTriangle, Link as LinkIcon, Hash, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VerificationResult {
  is_valid: boolean
  total_entries: number
  broken_links: Array<{ entry_id: string; expected_hash: string; actual_hash: string }>
  first_entry_timestamp: string
  last_entry_timestamp: string
}

const AuditChainVerify = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [insights, setInsights] = useState<string>('')
  const [recommendation, setRecommendation] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  const verifyAuditChain = async () => {
    if (!profile?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('audit-chain-verify', {
        body: {
          org_id: profile.organization_id
        }
      })

      if (error) throw error

      setVerification(data.verification)
      setInsights(data.ai_insights)
      setRecommendation(data.recommendation)

      toast({
        title: data.verification.is_valid ? "Chain Verified" : "Issues Detected",
        description: data.recommendation,
        variant: data.verification.is_valid ? "default" : "destructive"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl tracking-tight mb-2 heading-unified">
          Audit Chain Verification
        </h1>
          <p className="text-muted-foreground font-medium">Cryptographic integrity verification for compliance audit logs</p>
        </div>
        <Button onClick={verifyAuditChain} disabled={loading} size="lg">
          <Shield className={`h-5 w-5 mr-2 ${loading ? 'animate-pulse' : ''}`} />
          Verify Chain
        </Button>
      </div>

      {/* Verification Status */}
      {verification && (
        <Card className="cockpit-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {verification.is_valid ? (
                <CheckCircle className="h-6 w-6 text-accent" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-destructive" />
              )}
              Chain Integrity Status
            </CardTitle>
            <CardDescription>
              {verification.is_valid 
                ? 'All audit entries are cryptographically linked and verified'
                : `${verification.broken_links.length} broken link(s) detected`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl bg-primary/10">
                <div className="text-3xl font-bold text-foreground mb-1">{verification.total_entries}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  Total Entries
                </div>
              </div>

              <div className={`p-4 rounded-xl ${verification.is_valid ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {verification.is_valid ? '✓' : verification.broken_links.length}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Broken Links
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30">
                <div className="text-sm font-bold text-foreground mb-1">
                  {Math.floor(
                    (new Date(verification.last_entry_timestamp).getTime() - 
                     new Date(verification.first_entry_timestamp).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )} days
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Chain Duration
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg border ${
              verification.is_valid 
                ? 'bg-accent/10 border-accent/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-start gap-3">
                {verification.is_valid ? (
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${
                    verification.is_valid ? 'text-accent' : 'text-destructive'
                  }`}>
                    {verification.is_valid ? 'Verification Passed' : 'Integrity Compromised'}
                  </p>
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              </div>
            </div>

            {/* Broken Links Details */}
            {verification.broken_links.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Broken Chain Links
                </h3>
                {verification.broken_links.map((link, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="space-y-1 text-xs font-mono">
                      <p><span className="text-muted-foreground">Entry ID:</span> {link.entry_id}</p>
                      <p><span className="text-muted-foreground">Expected:</span> <code>{link.expected_hash.substring(0, 16)}...</code></p>
                      <p><span className="text-muted-foreground">Actual:</span> <code>{link.actual_hash.substring(0, 16)}...</code></p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Insights */}
            {insights && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  AI Analysis
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-lg bg-muted/30">
                    {insights}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!verification && (
        <Card className="cockpit-panel">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Audit Chain Verification</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Verify the cryptographic integrity of your compliance audit trail using SHA-256 hash chaining
            </p>
            <Button onClick={verifyAuditChain} disabled={loading} size="lg">
              <Shield className="h-5 w-5 mr-2" />
              Run Verification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AuditChainVerify
