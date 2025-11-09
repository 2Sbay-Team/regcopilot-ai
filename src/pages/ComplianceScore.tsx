import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Shield, FileCheck, Leaf, TrendingUp, RefreshCw } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"

const ComplianceScore = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [currentScore, setCurrentScore] = useState<any>(null)
  const [scoreHistory, setScoreHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadScores()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    setProfile(data)
  }

  const loadScores = async () => {
    const { data } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('calculated_at', { ascending: false })
      .limit(30)

    if (data && data.length > 0) {
      setCurrentScore(data[0])
      setScoreHistory(data.reverse())
    }
  }

  const calculateScore = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('calculate-compliance-score')
      
      if (error) throw error

      toast({ title: "Score Calculated", description: "Compliance score updated successfully" })
      loadScores()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl tracking-tight mb-2 heading-dual-tone">
          Compliance <span className="secondary">Score</span>
        </h1>
          <p className="text-muted-foreground font-medium">Overall compliance health and trends</p>
        </div>
        <Button onClick={calculateScore} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>

      {currentScore && (
        <>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Overall Compliance Score
              </CardTitle>
              <CardDescription>Weighted average across all compliance areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-6xl font-bold ${getScoreColor(currentScore.overall_score)}`}>
                    {currentScore.overall_score}
                  </span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <Progress 
                  value={currentScore.overall_score} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground">
                  Last calculated: {format(parseISO(currentScore.calculated_at), 'PPpp')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  AI Act Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-4xl font-bold ${getScoreColor(currentScore.ai_act_score)}`}>
                  {currentScore.ai_act_score}
                </div>
                <Progress value={currentScore.ai_act_score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on high-risk AI systems and Annex IV compliance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCheck className="h-5 w-5 text-primary" />
                  GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-4xl font-bold ${getScoreColor(currentScore.gdpr_score)}`}>
                  {currentScore.gdpr_score}
                </div>
                <Progress value={currentScore.gdpr_score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on privacy assessments and violations detected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-primary" />
                  ESG Reporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-4xl font-bold ${getScoreColor(currentScore.esg_score)}`}>
                  {currentScore.esg_score}
                </div>
                <Progress value={currentScore.esg_score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Based on CSRD/ESRS reporting completeness
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>Historical compliance score over time</CardDescription>
            </CardHeader>
            <CardContent>
              {scoreHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="calculated_at" 
                      tickFormatter={(val) => format(parseISO(val), 'MMM dd')}
                      className="text-xs"
                    />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(val) => format(parseISO(val), 'PPpp')}
                    />
                    <Line type="monotone" dataKey="overall_score" stroke="hsl(var(--primary))" strokeWidth={2} name="Overall" />
                    <Line type="monotone" dataKey="ai_act_score" stroke="#3b82f6" strokeWidth={2} name="AI Act" />
                    <Line type="monotone" dataKey="gdpr_score" stroke="#10b981" strokeWidth={2} name="GDPR" />
                    <Line type="monotone" dataKey="esg_score" stroke="#22c55e" strokeWidth={2} name="ESG" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Not enough historical data. Recalculate score regularly to see trends.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!currentScore && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No compliance score calculated yet</p>
            <Button onClick={calculateScore} className="mt-4">
              Calculate First Score
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ComplianceScore
