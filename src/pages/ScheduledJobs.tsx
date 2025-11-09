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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Play, Pause, Plus } from "lucide-react";

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Scheduled Job</DialogTitle>
              <DialogDescription>
                Set up automated compliance workflows
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Name</Label>
                <Input
                  value={newJob.name}
                  onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                  placeholder="Daily GDPR Scan"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={newJob.job_type}
                  onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance_scan">Compliance Scan</SelectItem>
                    <SelectItem value="connector_sync">Connector Sync</SelectItem>
                    <SelectItem value="report_generation">Report Generation</SelectItem>
                    <SelectItem value="intelligence_score">Intelligence Score Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select
                  value={newJob.schedule}
                  onValueChange={(value) => setNewJob({ ...newJob, schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0 0 * * *">Daily at midnight</SelectItem>
                    <SelectItem value="0 0 * * 0">Weekly on Sunday</SelectItem>
                    <SelectItem value="0 0 1 * *">Monthly on 1st</SelectItem>
                    <SelectItem value="0 */6 * * *">Every 6 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createJob}>Create Job</Button>
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