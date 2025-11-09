import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart,
  Star,
  MessageCircle,
  Plus,
  RefreshCw,
  Linkedin,
  Building2,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

const SocialSentiment = () => {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    linkedin_url: '',
    glassdoor_url: ''
  });

  const fetchSentimentData = async () => {
    try {
      const { data, error } = await supabase
        .from('social_sentiment_data')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (error) throw error;
      setSentimentData(data || []);
    } catch (error: any) {
      console.error('Error fetching sentiment data:', error);
      toast.error('Failed to load sentiment data');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!formData.company_name || (!formData.linkedin_url && !formData.glassdoor_url)) {
      toast.error('Please provide company name and at least one URL');
      return;
    }

    setAnalyzing(true);
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('Not authenticated');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', profile.user.id)
        .single();

      if (!profileData) throw new Error('Profile not found');

      toast.info('Starting social sentiment analysis...');
      
      const { error } = await supabase.functions.invoke('social-sentiment-analysis', {
        body: {
          company_name: formData.company_name,
          linkedin_url: formData.linkedin_url || undefined,
          glassdoor_url: formData.glassdoor_url || undefined,
          organization_id: profileData.organization_id
        }
      });

      if (error) throw error;
      
      toast.success('Analysis completed successfully!');
      setShowNewAnalysis(false);
      setFormData({ company_name: '', linkedin_url: '', glassdoor_url: '' });
      await fetchSentimentData();
    } catch (error: any) {
      console.error('Error running analysis:', error);
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();

    // Real-time subscription
    const channel = supabase
      .channel('sentiment_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_sentiment_data' }, () => {
        fetchSentimentData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.0) return 'text-green-600';
    if (rating >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 0.6) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score >= 0.3) return <TrendingDown className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ESG Social Sentiment Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Employee satisfaction and social impact metrics from LinkedIn and Glassdoor
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSentimentData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showNewAnalysis} onOpenChange={setShowNewAnalysis}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Run Social Sentiment Analysis</DialogTitle>
                  <DialogDescription>
                    Analyze employee reviews from LinkedIn and Glassdoor to extract ESG social metrics
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      placeholder="e.g., Acme Corporation"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>LinkedIn Company Page URL (Optional)</Label>
                    <Input
                      placeholder="https://www.linkedin.com/company/..."
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Glassdoor Company Page URL (Optional)</Label>
                    <Input
                      placeholder="https://www.glassdoor.com/Overview/..."
                      value={formData.glassdoor_url}
                      onChange={(e) => setFormData({ ...formData, glassdoor_url: e.target.value })}
                    />
                  </div>

                  {analyzing && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Analyzing sentiment...</p>
                      <Progress value={50} className="w-full" />
                    </div>
                  )}

                  <Button onClick={runAnalysis} disabled={analyzing} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {analyzing ? 'Analyzing...' : 'Run Analysis'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {sentimentData.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No sentiment analysis data yet. Click "New Analysis" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sentimentData.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {item.source === 'linkedin' ? (
                        <Linkedin className="w-8 h-8 text-blue-600" />
                      ) : (
                        <Building2 className="w-8 h-8 text-green-600" />
                      )}
                      <div>
                        <CardTitle>{item.company_name}</CardTitle>
                        <CardDescription>
                          {item.source === 'linkedin' ? 'LinkedIn' : 'Glassdoor'} · 
                          Analyzed {format(new Date(item.analyzed_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(item.sentiment_score)}
                      <span className="text-2xl font-bold">
                        {item.overall_rating?.toFixed(1) || 'N/A'}
                      </span>
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="ratings">Ratings</TabsTrigger>
                      <TabsTrigger value="themes">Themes</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Reviews</p>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-2xl font-bold">{item.total_reviews}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Sentiment Score</p>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-2xl font-bold">
                              {((item.sentiment_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Overall Rating</p>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className={`text-2xl font-bold ${getRatingColor(item.overall_rating)}`}>
                              {item.overall_rating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">AI Summary</h4>
                        <p className="text-sm text-muted-foreground">{item.ai_summary}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">ESG Recommendations</h4>
                        <p className="text-sm text-muted-foreground">{item.recommendations}</p>
                      </div>

                      {item.esg_indicators && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">ESG Indicators</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(item.esg_indicators).map(([key, value]: [string, any]) => (
                              <div key={key} className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-sm">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="ratings" className="space-y-3 mt-4">
                      {[
                        { label: 'Work-Life Balance', value: item.work_life_balance_rating },
                        { label: 'Culture & Values', value: item.culture_values_rating },
                        { label: 'Diversity & Inclusion', value: item.diversity_inclusion_rating },
                        { label: 'Career Opportunities', value: item.career_opportunities_rating },
                        { label: 'Compensation & Benefits', value: item.compensation_benefits_rating },
                        { label: 'Senior Management', value: item.senior_management_rating }
                      ].map((rating) => rating.value && (
                        <div key={rating.label} className="flex items-center justify-between">
                          <span className="text-sm">{rating.label}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(rating.value / 5) * 100} 
                              className="w-32"
                            />
                            <span className={`text-sm font-medium ${getRatingColor(rating.value)}`}>
                              {rating.value.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="themes" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold">Positive Themes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.positive_themes?.map((theme: string, idx: number) => (
                            <Badge key={idx} className="bg-green-100 text-green-800 hover:bg-green-200">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                          <h4 className="font-semibold">Negative Themes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.negative_themes?.map((theme: string, idx: number) => (
                            <Badge key={idx} variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-3 mt-4">
                      {item.sample_reviews?.map((review: any, idx: number) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{review.rating}/5</span>
                              {review.title && <span className="text-sm text-muted-foreground">· {review.title}</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {review.date && format(new Date(review.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{review.text}</p>
                          {review.pros && (
                            <p className="text-xs text-green-600">
                              <strong>Pros:</strong> {review.pros}
                            </p>
                          )}
                          {review.cons && (
                            <p className="text-xs text-red-600">
                              <strong>Cons:</strong> {review.cons}
                            </p>
                          )}
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSentiment;