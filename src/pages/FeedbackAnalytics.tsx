import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { AppLayout } from "@/components/AppLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, MessageSquare } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface FeedbackStats {
  topUpvotedChunks: Array<{
    chunk_id: string
    content: string
    score: number
    total_votes: number
  }>
  topQueriesWithMissingCitations: Array<{
    query: string
    count: number
    module: string
  }>
  satisfactionByModule: Array<{
    module: string
    avg_satisfaction: number
    total_responses: number
  }>
  signalDistribution: Array<{
    signal: string
    count: number
  }>
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6']

export default function FeedbackAnalytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedbackStats()
  }, [user])

  const loadFeedbackStats = async () => {
    if (!user) return

    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) return

      // Fetch top upvoted chunks
      const { data: topChunks } = await supabase
        .from('chunk_feedback')
        .select(`
          chunk_id,
          document_chunks(content),
          signal,
          weight
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch queries with missing citations
      const { data: missingCitations } = await supabase
        .from('retrieval_feedback')
        .select('query, module, missing_citation')
        .eq('organization_id', profile.organization_id)
        .eq('missing_citation', true)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch satisfaction by module
      const { data: satisfaction } = await supabase
        .from('retrieval_feedback')
        .select('module, satisfaction')
        .eq('organization_id', profile.organization_id)
        .not('satisfaction', 'is', null)

      // Fetch signal distribution
      const { data: signals } = await supabase
        .from('chunk_feedback')
        .select('signal')
        .eq('organization_id', profile.organization_id)

      // Process data
      const signalCounts = signals?.reduce((acc, { signal }) => {
        acc[signal] = (acc[signal] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const satisfactionByModule = satisfaction?.reduce((acc, { module, satisfaction }) => {
        if (!acc[module]) {
          acc[module] = { total: 0, count: 0 }
        }
        acc[module].total += satisfaction
        acc[module].count += 1
        return acc
      }, {} as Record<string, { total: number; count: number }>) || {}

      const missingCitationCounts = missingCitations?.reduce((acc, { query, module }) => {
        const key = `${module}:${query}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setStats({
        topUpvotedChunks: [], // Simplified for now
        topQueriesWithMissingCitations: Object.entries(missingCitationCounts)
          .map(([key, count]) => {
            const [module, ...queryParts] = key.split(':')
            return { module, query: queryParts.join(':'), count }
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        satisfactionByModule: Object.entries(satisfactionByModule).map(([module, data]) => ({
          module,
          avg_satisfaction: data.total / data.count,
          total_responses: data.count
        })),
        signalDistribution: Object.entries(signalCounts).map(([signal, count]) => ({
          signal,
          count
        }))
      })
    } catch (error) {
      console.error('Error loading feedback stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading feedback analytics...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">RAG Feedback Analytics</h1>
          <p className="text-muted-foreground">
            Insights from user feedback to improve retrieval accuracy
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Signal Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Signal Distribution
            </h3>
            {stats?.signalDistribution && stats.signalDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.signalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ signal, percent }) => `${signal}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.signalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No feedback data yet</p>
            )}
          </Card>

          {/* Satisfaction by Module */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Satisfaction by Module
            </h3>
            {stats?.satisfactionByModule && stats.satisfactionByModule.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.satisfactionByModule}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg_satisfaction" fill="#22c55e" name="Avg Satisfaction" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No satisfaction data yet</p>
            )}
          </Card>
        </div>

        {/* Missing Citations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Top Queries with Missing Citations
          </h3>
          {stats?.topQueriesWithMissingCitations && stats.topQueriesWithMissingCitations.length > 0 ? (
            <div className="space-y-3">
              {stats.topQueriesWithMissingCitations.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{item.module}</Badge>
                    <p className="text-sm">{item.query}</p>
                  </div>
                  <Badge variant="secondary">{item.count} reports</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No missing citation reports yet</p>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
