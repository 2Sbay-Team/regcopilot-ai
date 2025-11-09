import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { InfoModal } from "@/components/InfoModal";
import { Calendar, Clock, Plus, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

interface ScheduledJob {
  id: string;
  job_name: string;
  job_type: string;
  schedule_cron: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  config: any;
}

export default function ScheduledJobs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newJob, setNewJob] = useState({
    job_name: "",
    job_type: "compliance_scan",
    schedule_cron: "0 0 * * *"
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
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
        .from("scheduled_jobs" as any)
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
        .returns<ScheduledJob[]>();

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error loading jobs:", error);
      toast({
        title: t('scheduledJobs.error', language),
        description: t('scheduledJobs.loadError', language),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = async (jobId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("scheduled_jobs" as any)
        .update({ enabled: !currentState } as any)
        .eq("id", jobId);

      if (error) throw error;

      toast({
        title: t('scheduledJobs.jobUpdated', language),
        description: `${t('scheduledJobs.jobUpdatedDesc', language)} ${!currentState ? t('scheduledJobs.jobEnabled', language) : t('scheduledJobs.jobDisabled', language)}.`
      });

      await loadJobs();
    } catch (error: any) {
      console.error("Error toggling job:", error);
      toast({
        title: t('scheduledJobs.error', language),
        description: t('scheduledJobs.updateError', language),
        variant: "destructive"
      });
    }
  };

  const createJob = async () => {
    // Validate inputs
    if (!newJob.job_name.trim()) {
      toast({
        title: t('scheduledJobs.validationError', language),
        description: t('scheduledJobs.nameRequired', language),
        variant: "destructive"
      });
      return;
    }

    if (newJob.job_name.length > 100) {
      toast({
        title: t('scheduledJobs.validationError', language),
        description: t('scheduledJobs.nameTooLong', language),
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from("scheduled_jobs" as any)
        .insert({
          job_name: newJob.job_name,
          job_type: newJob.job_type,
          schedule_cron: newJob.schedule_cron,
          organization_id: profile.organization_id,
          enabled: true
        } as any);

      if (error) throw error;

      toast({
        title: t('scheduledJobs.jobCreated', language),
        description: t('scheduledJobs.jobCreatedDesc', language)
      });

      setShowDialog(false);
      setNewJob({ job_name: "", job_type: "compliance_scan", schedule_cron: "0 0 * * *" });
      await loadJobs();
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({
        title: t('scheduledJobs.error', language),
        description: t('scheduledJobs.createError', language),
        variant: "destructive"
      });
    }
  };

  const formatSchedule = (cron: string) => {
    const schedules: Record<string, string> = {
      "0 0 * * *": t('scheduledJobs.dailyMidnight', language),
      "0 0 * * 0": t('scheduledJobs.weeklySunday', language),
      "0 0 1 * *": t('scheduledJobs.monthlyFirst', language),
      "0 */6 * * *": t('scheduledJobs.every6Hours', language)
    };
    return schedules[cron] || cron;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('scheduledJobs.title', language)}</h1>
          <p className="text-muted-foreground">{t('scheduledJobs.subtitle', language)}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('scheduledJobs.newJob', language)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('scheduledJobs.createTitle', language)}</DialogTitle>
              <DialogDescription>
                {t('scheduledJobs.createDesc', language)}
              </DialogDescription>
            </DialogHeader>
            
            {/* Help Section */}
            <Alert className="bg-muted/50 border-border">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('scheduledJobs.helpText', language)}
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="job-name">{t('scheduledJobs.jobName', language)}</Label>
                  <InfoModal 
                    title={t('scheduledJobs.jobNameTitle', language)}
                    description={t('scheduledJobs.jobNameDesc', language)}
                    example={t('scheduledJobs.jobNameExample', language)}
                  />
                </div>
                <Input
                  id="job-name"
                  value={newJob.job_name}
                  onChange={(e) => setNewJob({ ...newJob, job_name: e.target.value })}
                  placeholder={t('scheduledJobs.jobNamePlaceholder', language)}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {newJob.job_name.length}/100 {t('scheduledJobs.jobNameHint', language)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="job-type">{t('scheduledJobs.jobType', language)}</Label>
                  <InfoModal 
                    title={t('scheduledJobs.jobTypeTitle', language)}
                    description={t('scheduledJobs.jobTypeDesc', language)}
                    example={t('scheduledJobs.jobTypeExample', language)}
                  />
                </div>
                <Select
                  value={newJob.job_type}
                  onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
                >
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder={t('scheduledJobs.jobTypePlaceholder', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance_scan">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.complianceScan', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.complianceScanDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="connector_sync">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.connectorSync', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.connectorSyncDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="report_generation">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.reportGeneration', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.reportGenerationDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intelligence_score">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.intelligenceScore', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.intelligenceScoreDesc', language)}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="schedule">{t('scheduledJobs.schedule', language)}</Label>
                  <InfoModal 
                    title={t('scheduledJobs.scheduleTitle', language)}
                    description={t('scheduledJobs.scheduleDesc', language)}
                    example={t('scheduledJobs.scheduleExample', language)}
                  />
                </div>
                <Select
                  value={newJob.schedule_cron}
                  onValueChange={(value) => setNewJob({ ...newJob, schedule_cron: value })}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder={t('scheduledJobs.schedulePlaceholder', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 0 * * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.dailyMidnight', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.dailyMidnightDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 0 * * 0">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.weeklySunday', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.weeklySundayDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 0 1 * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.monthlyFirst', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.monthlyFirstDesc', language)}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 */6 * * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{t('scheduledJobs.every6Hours', language)}</span>
                        <span className="text-xs text-muted-foreground">{t('scheduledJobs.every6HoursDesc', language)}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t('scheduledJobs.cancel', language)}
              </Button>
              <Button onClick={createJob} disabled={!newJob.job_name.trim()}>
                {t('scheduledJobs.createJob', language)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">{t('scheduledJobs.loading', language)}</p>
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {t('scheduledJobs.noJobs', language)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{job.job_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mt-2">
                      {job.job_type.replace(/_/g, " ")}
                    </Badge>
                  </CardDescription>
                </div>
                <Switch
                  checked={job.enabled}
                  onCheckedChange={() => toggleJob(job.id, job.enabled)}
                />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatSchedule(job.schedule_cron)}
                  </div>
                  {job.last_run_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('scheduledJobs.lastRun', language)}: {new Date(job.last_run_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}