import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  const [showPredictions, setShowPredictions] = useState(true)
  const [forecastDays, setForecastDays] = useState("7")
  const [assessmentTrends, setAssessmentTrends] = useState<any[]>([])
  const [violationCounts, setViolationCounts] = useState<any[]>([])
  const [riskDistribution, setRiskDistribution] = useState<any[]>([])
  const [moduleActivity, setModuleActivity] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [predictedWorkload, setPredictedWorkload] = useState<number>(0)
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  useEffect(() => {
    if (assessmentTrends.length > 0 && showPredictions) {
      calculatePredictions()
    } else {
      setPredictions([])
    }
  }, [assessmentTrends, forecastDays, showPredictions])

  const linearRegression = (data: number[]) => {
    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, val) => sum + val, 0)
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  const calculatePredictions = () => {
    const days = parseInt(forecastDays)
    const aiActData = assessmentTrends.map(t => t.aiAct)
    const gdprData = assessmentTrends.map(t => t.gdpr)
    const esgData = assessmentTrends.map(t => t.esg)

    const aiActModel = linearRegression(aiActData)
    const gdprModel = linearRegression(gdprData)
    const esgModel = linearRegression(esgData)

    const futurePredictions = []
    const lastDate = new Date(assessmentTrends[assessmentTrends.length - 1]?.date || new Date())
    
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(lastDate)
      futureDate.setDate(futureDate.getDate() + i)
      const x = assessmentTrends.length + i - 1

      futurePredictions.push({
        date: futureDate.toLocaleDateString(),
        aiAct: Math.max(0, Math.round(aiActModel.slope * x + aiActModel.intercept)),
        gdpr: Math.max(0, Math.round(gdprModel.slope * x + gdprModel.intercept)),
        esg: Math.max(0, Math.round(esgModel.slope * x + esgModel.intercept)),
        isPrediction: true,
      })
    }

    const totalWorkload = futurePredictions.reduce(
      (sum, p) => sum + p.aiAct + p.gdpr + p.esg,
      0
    )
    setPredictedWorkload(totalWorkload)
    setPredictions(futurePredictions)
  }

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

      // Calculate risk heatmap data
      await calculateHeatmap(startDate)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load analytics", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const calculateHeatmap = async (startDate: Date) => {
    try {
      // Get AI Act high-risk assessments
      const { data: aiActData } = await supabase
        .from("ai_act_assessments")
        .select("created_at, risk_category")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      // Get GDPR violations
      const { data: gdprData } = await supabase
        .from("gdpr_assessments")
        .select("created_at, violations")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      // Get ESG reports with issues
      const { data: esgData } = await supabase
        .from("esg_reports")
        .select("created_at, completeness_score, anomalies_detected")
        .gte("created_at", startDate.toISOString())
        .order("created_at")

      // Create weekly buckets
      const weekMap = new Map<string, any>()
      
      const getWeekKey = (date: string) => {
        const d = new Date(date)
        const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-W${week}`
      }

      // Aggregate AI Act risks by week
      aiActData?.forEach((item) => {
        const weekKey = getWeekKey(item.created_at)
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { week: weekKey, aiActRisk: 0, gdprViolations: 0, esgIssues: 0 })
        }
        const entry = weekMap.get(weekKey)
        if (item.risk_category === 'high' || item.risk_category === 'unacceptable') {
          entry.aiActRisk++
        }
      })

      // Aggregate GDPR violations by week
      gdprData?.forEach((item) => {
        const weekKey = getWeekKey(item.created_at)
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { week: weekKey, aiActRisk: 0, gdprViolations: 0, esgIssues: 0 })
        }
        const entry = weekMap.get(weekKey)
        const violations = Array.isArray(item.violations) ? item.violations : []
        entry.gdprViolations += violations.length
      })

      // Aggregate ESG issues by week
      esgData?.forEach((item) => {
        const weekKey = getWeekKey(item.created_at)
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { week: weekKey, aiActRisk: 0, gdprViolations: 0, esgIssues: 0 })
        }
        const entry = weekMap.get(weekKey)
        const hasLowCompleteness = (item.completeness_score || 100) < 70
        const hasAnomalies = item.anomalies_detected && item.anomalies_detected.length > 0
        if (hasLowCompleteness || hasAnomalies) {
          entry.esgIssues++
        }
      })

      const heatmap = Array.from(weekMap.values()).sort((a, b) => a.week.localeCompare(b.week))
      setHeatmapData(heatmap)
    } catch (error: any) {
      console.error("Failed to calculate heatmap:", error)
    }
  }

  const getHeatmapColor = (value: number, max: number) => {
    if (value === 0) return "hsl(var(--muted))"
    const intensity = Math.min(value / max, 1)
    if (intensity < 0.3) return "hsl(var(--chart-4))"
    if (intensity < 0.6) return "hsl(142 76% 36%)" // warning yellow-green
    if (intensity < 0.8) return "hsl(25 95% 53%)" // warning orange
    return "hsl(0 84% 60%)" // high risk red
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
              <p className="text-sm text-muted-foreground">Trends and insights with AI forecasting</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Predictive Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>
                  AI-powered forecasting for compliance workload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="predictions"
                        checked={showPredictions}
                        onCheckedChange={setShowPredictions}
                      />
                      <Label htmlFor="predictions">Show Predictions</Label>
                    </div>
                    {showPredictions && (
                      <Select value={forecastDays} onValueChange={setForecastDays}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days ahead</SelectItem>
                          <SelectItem value="14">14 days ahead</SelectItem>
                          <SelectItem value="30">30 days ahead</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {showPredictions && predictedWorkload > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Predicted Workload</p>
                      <p className="text-2xl font-bold text-primary">
                        {predictedWorkload} assessments
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                  <LineChart data={[...assessmentTrends, ...predictions]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                      }}
                      formatter={(value: any, name: string, props: any) => [
                        value,
                        props.payload.isPrediction ? `${name} (predicted)` : name,
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="aiAct"
                      stroke="hsl(var(--chart-1))"
                      name="AI Act"
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="gdpr"
                      stroke="hsl(var(--chart-2))"
                      name="GDPR"
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="esg"
                      stroke="hsl(var(--chart-3))"
                      name="ESG"
                      strokeWidth={2}
                      connectNulls
                    />
                    {showPredictions && predictions.length > 0 && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="aiAct"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictions}
                          name="AI Act (predicted)"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="gdpr"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictions}
                          name="GDPR (predicted)"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="esg"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          data={predictions}
                          name="ESG (predicted)"
                          dot={false}
                        />
                      </>
                    )}
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

            {/* Risk Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Concentration Heatmap
                </CardTitle>
                <CardDescription>
                  Weekly view of compliance violations and high-risk systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                {heatmapData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-sm text-muted-foreground">Period</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="font-medium text-sm text-muted-foreground">AI Act High Risk</div>
                        <div className="font-medium text-sm text-muted-foreground">GDPR Violations</div>
                        <div className="font-medium text-sm text-muted-foreground">ESG Issues</div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {heatmapData.map((row) => {
                        const maxValue = Math.max(
                          ...heatmapData.flatMap(r => [r.aiActRisk, r.gdprViolations, r.esgIssues])
                        )
                        return (
                          <div key={row.week} className="grid grid-cols-[120px_1fr] gap-2">
                            <div className="text-sm py-2 truncate">{row.week}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div
                                className="rounded p-2 text-center text-sm font-medium transition-colors"
                                style={{
                                  backgroundColor: getHeatmapColor(row.aiActRisk, maxValue),
                                  color: row.aiActRisk > maxValue * 0.3 ? "hsl(var(--background))" : "hsl(var(--foreground))",
                                }}
                              >
                                {row.aiActRisk}
                              </div>
                              <div
                                className="rounded p-2 text-center text-sm font-medium transition-colors"
                                style={{
                                  backgroundColor: getHeatmapColor(row.gdprViolations, maxValue),
                                  color: row.gdprViolations > maxValue * 0.3 ? "hsl(var(--background))" : "hsl(var(--foreground))",
                                }}
                              >
                                {row.gdprViolations}
                              </div>
                              <div
                                className="rounded p-2 text-center text-sm font-medium transition-colors"
                                style={{
                                  backgroundColor: getHeatmapColor(row.esgIssues, maxValue),
                                  color: row.esgIssues > maxValue * 0.3 ? "hsl(var(--background))" : "hsl(var(--foreground))",
                                }}
                              >
                                {row.esgIssues}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-4 pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--muted))" }}></div>
                        <span>None</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--chart-4))" }}></div>
                        <span>Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(142 76% 36%)" }}></div>
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(25 95% 53%)" }}></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0 84% 60%)" }}></div>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No risk data available</p>
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
