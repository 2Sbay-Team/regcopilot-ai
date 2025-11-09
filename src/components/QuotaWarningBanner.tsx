import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, X } from "lucide-react";
import { Link } from "react-router-dom";

export const QuotaWarningBanner = () => {
  const { user } = useAuth();
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkQuota();
      // Check quota every 5 minutes
      const interval = setInterval(checkQuota, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkQuota = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('llm_token_quota, tokens_used_this_month, billing_model')
        .eq('id', profile.organization_id)
        .single();

      if (org) {
        const usagePercentage = (org.tokens_used_this_month / org.llm_token_quota) * 100;
        
        if (usagePercentage >= 80 && org.billing_model !== 'byok') {
          setQuotaInfo({
            percentage: usagePercentage,
            used: org.tokens_used_this_month,
            quota: org.llm_token_quota,
            remaining: org.llm_token_quota - org.tokens_used_this_month,
            critical: usagePercentage >= 90
          });
        } else {
          setQuotaInfo(null);
        }
      }
    } catch (error) {
      console.error('Error checking quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quotaInfo || dismissed) return null;

  return (
    <Alert 
      variant={quotaInfo.critical ? "destructive" : "default"}
      className="mb-4 relative"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between pr-8">
        {quotaInfo.critical ? "Critical: Token Quota Almost Exceeded" : "Warning: High Token Usage"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p>
            You've used <strong>{quotaInfo.percentage.toFixed(1)}%</strong> of your monthly token quota 
            ({quotaInfo.used.toLocaleString()} / {quotaInfo.quota.toLocaleString()} tokens).
          </p>
          <p className="text-sm">
            Only <strong>{quotaInfo.remaining.toLocaleString()} tokens</strong> remaining this month.
          </p>
          <div className="flex gap-2 mt-3">
            <Button asChild size="sm" variant={quotaInfo.critical ? "default" : "outline"}>
              <Link to="/usage">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/settings">
                Configure BYOK
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
};
