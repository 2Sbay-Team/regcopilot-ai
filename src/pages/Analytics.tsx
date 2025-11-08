import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [assessmentTrends, setAssessmentTrends] = useState<any[]>([])
  const [violationCounts, setViolationCounts] = useState<any[]>([])
  const [riskDistribution, setRiskDistribution] = useState<any[]>([])
  const [moduleActivity, setModuleActivity] = useState<any[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const daysAgo = parseInt(timeRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Get assessment trends over time
      const { data: aiActData } = await supabase
        .from("ai_act_assessments")
        .select("created_at, risk_category")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      const { data: gdprData } = await supabase
        .from("gdpr_assessments")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      const { data: esgData } = await supabase
        .from("esg_reports")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      // Aggregate by day
      const trendMap = new Map()
      const aggregateByDay = (data: any[], type: string) => {
        data?.forEach((item) => {
          const date = new Date(item.created_at).toLocaleDateString()
          if (!trendMap.has(date)) {
            trendMap.set(date, { date, aiAct: 0, gdpr: 0, esg: 0 })
          }
          const entry = trendMap.get(date)
          entry[type]++
        })
      }

      aggregateByDay(aiActData || [], "aiAct")
      aggregateByDay(gdprData || [], "gdpr")
      aggregateByDay(esgData || [], "esg")

      const trends = Array.from(trendMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setAssessmentTrends(trends)

      // Risk distribution from AI Act assessments
      const riskMap = new Map()
      aiActData?.forEach((item) => {
        const risk = item.risk_category || "unknown"
        riskMap.set(risk, (riskMap.get(risk) || 0) + 1)
      })

      const riskDist = Array.from(riskMap.entries()).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      setRiskDistribution(riskDist)

      // GDPR violations count
      const { data: gdprAssessments } = await supabase
        .from("gdpr_assessments")
        .select("violations")
        .gte("created_at", startDate.toISOString())

      const violationTypes = new Map()
      gdprAssessments?.forEach((assessment) => {
        if (assessment.violations) {
          const violations = Array.isArray(assessment.violations)
            ? assessment.violations
            : []
          violations.forEach((v: any) => {
            const article = v.article || "Unknown"
            violationTypes.set(article, (violationTypes.get(article) || 0) + 1)
          })
        }
      })

      const violations = Array.from(violationTypes.entries())
        .map(([article, count]) => ({ article, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      setViolationCounts(violations)

      // Module activity from audit logs
      const { data: auditData } = await supabase
        .from("audit_logs")
        .select("agent")
        .gte("timestamp", startDate.toISOString())

      const activityMap = new Map()
      auditData?.forEach((log) => {
        const agent = log.agent || "unknown"
        activityMap.set(agent, (activityMap.get(agent) || 0) + 1)
      })

      const activity = Array.from(activityMap.entries()).map(([name, count]) => ({
        name,
        count,
      }))
      setModuleActivity(activity)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load analytics", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Compliance Analytics</h1>
              <p className="text-sm text-muted-foreground">Trends and insights</p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Assessment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Assessment Trends
                </CardTitle>
                <CardDescription>
                  Number of assessments by type over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={assessmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="aiAct"
                      stroke="hsl(var(--chart-1))"
                      name="AI Act"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="gdpr"
                      stroke="hsl(var(--chart-2))"
                      name="GDPR"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="esg"
                      stroke="hsl(var(--chart-3))"
                      name="ESG"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    AI Risk Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of AI systems by risk level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {riskDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No risk data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Module Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Module Activity
                  </CardTitle>
                  <CardDescription>
                    Usage by compliance module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {moduleActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={moduleActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No activity data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* GDPR Violations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top GDPR Violations
                </CardTitle>
                <CardDescription>
                  Most common GDPR articles violated
                </CardDescription>
              </CardHeader>
              <CardContent>
                {violationCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={violationCounts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="article" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No violation data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
