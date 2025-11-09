import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Search, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TopQuery {
  query: string;
  count: number;
  result_found: boolean;
}

interface FeedbackStats {
  doc_path: string;
  helpful: number;
  unhelpful: number;
  total: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function HelpInsights() {
  const [topQueries, setTopQueries] = useState<TopQuery[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
  const [searchTrends, setSearchTrends] = useState<any[]>([]);
  const [missingTopics, setMissingTopics] = useState<TopQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Top queries
      const { data: queries } = await supabase
        .from('help_search_logs')
        .select('query, result_found')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (queries) {
        const queryCounts = queries.reduce((acc: any, q) => {
          const key = q.query.toLowerCase();
          if (!acc[key]) {
            acc[key] = { query: q.query, count: 0, result_found: q.result_found };
          }
          acc[key].count++;
          return acc;
        }, {});

        const topQueriesData = Object.values(queryCounts)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10) as TopQuery[];

        setTopQueries(topQueriesData);

        // Missing topics (queries with no results)
        const missing = topQueriesData.filter(q => !q.result_found);
        setMissingTopics(missing);
      }

      // Feedback stats
      const { data: feedback } = await supabase
        .from('help_feedback')
        .select('doc_path, helpful');

      if (feedback) {
        const stats = feedback.reduce((acc: any, f) => {
          if (!acc[f.doc_path]) {
            acc[f.doc_path] = { doc_path: f.doc_path, helpful: 0, unhelpful: 0, total: 0 };
          }
          acc[f.doc_path].total++;
          if (f.helpful) {
            acc[f.doc_path].helpful++;
          } else {
            acc[f.doc_path].unhelpful++;
          }
          return acc;
        }, {});

        setFeedbackStats(Object.values(stats));
      }

      // Search trends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: trends } = await supabase
        .from('help_search_logs')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (trends) {
        const trendsByDay = trends.reduce((acc: any, t) => {
          const day = new Date(t.created_at).toLocaleDateString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});

        const trendsData = Object.entries(trendsByDay).map(([date, count]) => ({
          date,
          searches: count
        }));

        setSearchTrends(trendsData);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load help analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation Insights</h1>
          <p className="text-muted-foreground">Analytics and feedback from help system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Total Searches</h3>
            </div>
            <p className="text-3xl font-bold">{topQueries.reduce((sum, q) => sum + q.count, 0)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Found Results</h3>
            </div>
            <p className="text-3xl font-bold">
              {topQueries.filter(q => q.result_found).length}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Feedback</h3>
            </div>
            <p className="text-3xl font-bold">
              {feedbackStats.reduce((sum, f) => sum + f.total, 0)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Missing Topics</h3>
            </div>
            <p className="text-3xl font-bold">{missingTopics.length}</p>
          </Card>
        </div>

        <Tabs defaultValue="queries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queries">Top Queries</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="missing">Missing Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Most Common Searches</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topQueries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="query" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feedback by Documentation</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {feedbackStats.map((stat, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stat.doc_path}</h4>
                        <Badge variant="secondary">{stat.total} responses</Badge>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{stat.helpful} ({Math.round((stat.helpful / stat.total) * 100)}%)</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{stat.unhelpful} ({Math.round((stat.unhelpful / stat.total) * 100)}%)</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Search Activity (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={searchTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="searches" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="missing" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Queries Without Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These topics need documentation or better coverage
              </p>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {missingTopics.map((topic, index) => (
                    <Card key={index} className="p-3 flex items-center justify-between">
                      <span className="font-medium">{topic.query}</span>
                      <Badge variant="destructive">{topic.count} searches</Badge>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}