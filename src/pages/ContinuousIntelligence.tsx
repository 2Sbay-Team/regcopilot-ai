import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Shield, Zap, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContinuousIntelligence() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({
    overall: 0,
    automation: 0,
    coverage: 0,
    response: 0,
    explainability: 0
  });

  useEffect(() => {
    loadIntelligenceScores();
  }, []);

  const loadIntelligenceScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("intelligence_scores")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading scores:", error);
        return;
      }

      if (data) {
        setScores({
          overall: data.overall_score,
          automation: data.automation_score,
          coverage: data.coverage_score,
          response: data.response_score,
          explainability: data.explainability_score
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-intelligence-score");
      
      if (error) throw error;
      
      toast({
        title: "Intelligence Score Updated",
        description: "Your continuous intelligence metrics have been recalculated."
      });
      
      await loadIntelligenceScores();
    } catch (error) {
      console.error("Error recalculating:", error);
      toast({
        title: "Calculation Failed",
        description: "Unable to recalculate intelligence scores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Continuous Intelligence Center</h1>
          <p className="text-muted-foreground">
            From compliance to continuous intelligence — transforming regulation into strategic insight
          </p>
        </div>
        <Button onClick={recalculateScores} disabled={loading}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Recalculate Scores
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Overall Intelligence Score
          </CardTitle>
          <CardDescription>
            Your organization's continuous compliance intelligence index
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-5xl font-bold ${getScoreColor(scores.overall)}`}>
                {scores.overall}
              </span>
              <span className="text-xl text-muted-foreground">
                {getScoreLabel(scores.overall)}
              </span>
            </div>
            <Progress value={scores.overall} className="h-4" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-500" />
              Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(scores.automation)}`}>
                {scores.automation}
              </div>
              <Progress value={scores.automation} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Scheduled workflows, triggers, automated checks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(scores.coverage)}`}>
                {scores.coverage}
              </div>
              <Progress value={scores.coverage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Compliance domains assessed, data sources connected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(scores.response)}`}>
                {scores.response}
              </div>
              <Progress value={scores.response} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Average time to remediate findings
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-purple-500" />
              Explainability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${getScoreColor(scores.explainability)}`}>
                {scores.explainability}
              </div>
              <Progress value={scores.explainability} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Audit trail completeness, reasoning transparency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cost Center → Intelligence Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Transform compliance from a reactive cost center into a proactive intelligence layer that drives business value.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
              View Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Continuous monitoring, real-time alerts, and automated workflows keep you ahead of regulatory changes.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/analytics")}>
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explainable Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Every decision is backed by reasoning chains, evidence links, and audit trails for complete transparency.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/explainability")}>
              View Explainability
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}