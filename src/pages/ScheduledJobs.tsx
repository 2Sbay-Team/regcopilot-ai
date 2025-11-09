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

interface ScheduledJob {
  id: string;
  name: string;
  job_type: string;
  schedule: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  config: any;
}

export default function ScheduledJobs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newJob, setNewJob] = useState({
    name: "",
    job_type: "compliance_scan",
    schedule: "0 0 * * *"
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
        title: "Error",
        description: "Failed to load scheduled jobs.",
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
        title: "Job Updated",
        description: `Job ${!currentState ? "enabled" : "disabled"} successfully.`
      });

      await loadJobs();
    } catch (error: any) {
      console.error("Error toggling job:", error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive"
      });
    }
  };

  const createJob = async () => {
    // Validate inputs
    if (!newJob.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job name is required.",
        variant: "destructive"
      });
      return;
    }

    if (newJob.name.length > 100) {
      toast({
        title: "Validation Error",
        description: "Job name must be less than 100 characters.",
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
          ...newJob,
          organization_id: profile.organization_id,
          created_by: user.id
        } as any);

      if (error) throw error;

      toast({
        title: "Job Created",
        description: "Scheduled job created successfully."
      });

      setShowDialog(false);
      setNewJob({ name: "", job_type: "compliance_scan", schedule: "0 0 * * *" });
      await loadJobs();
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create scheduled job.",
        variant: "destructive"
      });
    }
  };

  const formatSchedule = (cron: string) => {
    const schedules: Record<string, string> = {
      "0 0 * * *": "Daily at midnight",
      "0 0 * * 0": "Weekly on Sunday",
      "0 0 1 * *": "Monthly on 1st",
      "0 */6 * * *": "Every 6 hours"
    };
    return schedules[cron] || cron;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Jobs</h1>
          <p className="text-muted-foreground">Automate compliance workflows and scans</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Scheduled Job</DialogTitle>
              <DialogDescription>
                Set up automated compliance workflows
              </DialogDescription>
            </DialogHeader>
            
            {/* Help Section */}
            <Alert className="bg-muted/50 border-border">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Scheduled jobs automate compliance tasks like scans, syncs, and reports. Choose a descriptive name, select the type of task, and set when it should run.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="job-name">Job Name</Label>
                  <InfoModal 
                    title="Job Name"
                    description="A descriptive name for your scheduled job. This helps you identify the job's purpose at a glance."
                    example="Examples:\n• Daily GDPR Privacy Scan\n• Weekly AI Act Compliance Check\n• Monthly ESG Report Generation\n• Nightly Connector Data Sync"
                  />
                </div>
                <Input
                  id="job-name"
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  placeholder="e.g., Daily GDPR Privacy Scan"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {newJob.name.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="job-type">Job Type</Label>
                  <InfoModal 
                    title="Job Type"
                    description="Select the type of automated task to perform. Each type serves a different compliance or data management purpose."
                    example="• Compliance Scan: Automatically check AI Act, GDPR, ESG compliance\n• Connector Sync: Pull data from external sources (SAP, Jira, SharePoint)\n• Report Generation: Create scheduled compliance reports\n• Intelligence Score: Update your continuous intelligence metrics"
                  />
                </div>
                <Select
                  value={newJob.job_type}
                  onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
                >
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance_scan">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Compliance Scan</span>
                        <span className="text-xs text-muted-foreground">Check AI Act, GDPR, ESG compliance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="connector_sync">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Connector Sync</span>
                        <span className="text-xs text-muted-foreground">Sync data from external sources</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="report_generation">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Report Generation</span>
                        <span className="text-xs text-muted-foreground">Generate scheduled reports</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="intelligence_score">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Intelligence Score Update</span>
                        <span className="text-xs text-muted-foreground">Refresh continuous intelligence metrics</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="schedule">Schedule</Label>
                  <InfoModal 
                    title="Schedule"
                    description="Define when and how often this job should run. Choose a frequency that matches your compliance requirements and data freshness needs."
                    example="• Daily at midnight: Good for regular compliance checks\n• Weekly on Sunday: Suitable for weekly reports\n• Monthly on 1st: Perfect for monthly reporting cycles\n• Every 6 hours: Use for time-sensitive data syncing"
                  />
                </div>
                <Select
                  value={newJob.schedule}
                  onValueChange={(value) => setNewJob({ ...newJob, schedule: value })}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 0 * * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Daily at midnight</span>
                        <span className="text-xs text-muted-foreground">Runs every day at 00:00 UTC</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 0 * * 0">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Weekly on Sunday</span>
                        <span className="text-xs text-muted-foreground">Runs every Sunday at 00:00 UTC</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 0 1 * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Monthly on 1st</span>
                        <span className="text-xs text-muted-foreground">Runs on the 1st of each month at 00:00 UTC</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="0 */6 * * *">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Every 6 hours</span>
                        <span className="text-xs text-muted-foreground">Runs 4 times daily (00:00, 06:00, 12:00, 18:00 UTC)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createJob} disabled={!newJob.name.trim()}>
                Create Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading jobs...</p>
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No scheduled jobs yet. Create your first automated workflow.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{job.name}</CardTitle>
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
                    {formatSchedule(job.schedule)}
                  </div>
                  {job.last_run_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Last run: {new Date(job.last_run_at).toLocaleString()}
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