import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Play, Plus, Settings, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActuatorRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  action_type: string;
  enabled: boolean;
  priority: number;
  ai_managed: boolean;
  last_executed_at: string | null;
  execution_count: number;
  condition_logic: any;
  action_config: any;
}

interface ActuatorLog {
  id: string;
  rule_id: string;
  trigger_source: string;
  action_type: string;
  status: string;
  execution_time_ms: number;
  executed_at: string;
  reasoning_summary: string;
}

export default function Automation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<ActuatorRule[]>([]);
  const [logs, setLogs] = useState<ActuatorLog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [testingRule, setTestingRule] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state for new rule
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger_type: "gdpr_violation",
    action_type: "email",
    priority: 5,
    condition_field: "risk_category",
    condition_operator: "equals",
    condition_value: "high",
    action_config: "{}"
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access the Automation Engine.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('actuator_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

      // Load recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('actuator_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      setLogs(logsData || []);

    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Error",
        description: "Failed to load automation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('actuator_rules')
        .update({ enabled: !currentState })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rule ${!currentState ? 'enabled' : 'disabled'} successfully`
      });

      await loadData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Error",
        description: "Failed to toggle rule",
        variant: "destructive"
      });
    }
  };

  const testRule = async (rule: ActuatorRule) => {
    try {
      setTestingRule(rule.id);

      const { data, error } = await supabase.functions.invoke('actuator-engine', {
        body: {
          trigger_source: rule.trigger_type,
          trigger_id: 'test-' + Date.now(),
          trigger_data: {
            risk_category: 'high',
            test_mode: true
          },
          test_mode: true
        }
      });

      if (error) throw error;

      toast({
        title: "Test Complete",
        description: `Rule tested successfully. ${data.executed} action(s) executed in test mode.`,
      });

    } catch (error) {
      console.error('Error testing rule:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestingRule(null);
    }
  };

  const createRule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const conditionLogic = {
        field: newRule.condition_field,
        operator: newRule.condition_operator,
        value: newRule.condition_value
      };

      let actionConfig = {};
      try {
        actionConfig = JSON.parse(newRule.action_config);
      } catch {
        actionConfig = { placeholder: true };
      }

      const { error } = await supabase
        .from('actuator_rules')
        .insert({
          organization_id: profile.organization_id,
          name: newRule.name,
          description: newRule.description,
          trigger_type: newRule.trigger_type,
          action_type: newRule.action_type,
          priority: newRule.priority,
          condition_logic: conditionLogic,
          action_config: actionConfig,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation rule created successfully"
      });

      setCreateDialogOpen(false);
      await loadData();

      // Reset form
      setNewRule({
        name: "",
        description: "",
        trigger_type: "gdpr_violation",
        action_type: "email",
        priority: 5,
        condition_field: "risk_category",
        condition_operator: "equals",
        condition_value: "high",
        action_config: "{}"
      });

    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: "Error",
        description: "Failed to create rule",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Automation Engine</h1>
            <p className="text-muted-foreground mt-1">
              Rule-based compliance automation with AI-ready architecture
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Define a new rule to automatically execute actions based on compliance events
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="High-Risk AI System Alert"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Send email alert when high-risk AI system is detected"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule({ ...newRule, trigger_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gdpr_violation">GDPR Violation</SelectItem>
                        <SelectItem value="ai_act_assessment">AI Act Assessment</SelectItem>
                        <SelectItem value="esg_metric">ESG Metric</SelectItem>
                        <SelectItem value="connector_sync">Connector Sync</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="action_type">Action Type</Label>
                    <Select value={newRule.action_type} onValueChange={(value) => setNewRule({ ...newRule, action_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="jira">Jira</SelectItem>
                        <SelectItem value="archive_file">Archive File</SelectItem>
                        <SelectItem value="move_file">Move File</SelectItem>
                        <SelectItem value="trigger_function">Trigger Function</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Condition Logic</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Field"
                      value={newRule.condition_field}
                      onChange={(e) => setNewRule({ ...newRule, condition_field: e.target.value })}
                    />
                    <Select value={newRule.condition_operator} onValueChange={(value) => setNewRule({ ...newRule, condition_operator: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="in">In</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={newRule.condition_value}
                      onChange={(e) => setNewRule({ ...newRule, condition_value: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="action_config">Action Config (JSON)</Label>
                  <Textarea
                    id="action_config"
                    value={newRule.action_config}
                    onChange={(e) => setNewRule({ ...newRule, action_config: e.target.value })}
                    placeholder='{"to": "admin@company.com", "subject": "Alert"}'
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={createRule}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {rules.filter(r => r.enabled).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">AI-Managed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                {rules.filter(r => r.ai_managed).length}
                <Sparkles className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(l => {
                  const today = new Date().toDateString();
                  return new Date(l.executed_at).toDateString() === today;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>
              Manage and monitor your automated compliance actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {rule.name}
                        {rule.ai_managed && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.trigger_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{rule.action_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id, rule.enabled)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.priority >= 7 ? "destructive" : "secondary"}>
                        {rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.last_executed_at ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(rule.last_executed_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testRule(rule)}
                        disabled={testingRule === rule.id}
                      >
                        {testingRule === rule.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {rules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No automation rules configured. Create your first rule to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
            <CardDescription>
              Last 20 automated actions executed by the engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Execution Time</TableHead>
                  <TableHead>Reasoning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.executed_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.trigger_source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{log.action_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Success
                        </Badge>
                      ) : log.status === 'failed' ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Skipped
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.execution_time_ms}ms
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.reasoning_summary}
                    </TableCell>
                  </TableRow>
                ))}
                
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No actions executed yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
