import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, RotateCcw, X, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentTask {
  id: string;
  organization_id: string;
  task_type: string;
  priority: number;
  status: string;
  payload: any;
  scheduled_for: string;
  started_at?: string;
  completed_at?: string;
  result?: any;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
}

const AgentDashboard = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchTasks();
    fetchHistory();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('agent_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_queue'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agent_queue')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent tasks',
        variant: 'destructive'
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('agent_task_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
  };

  const runAgentNow = async () => {
    setRunningAgent(true);
    const { error } = await supabase.functions.invoke('agent-runner');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to run agent',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Agent run initiated successfully'
      });
      fetchTasks();
    }
    setRunningAgent(false);
  };

  const cancelTask = async (taskId: string) => {
    const { error } = await supabase
      .from('agent_queue')
      .update({ status: 'cancelled' })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel task',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Task cancelled'
      });
      fetchTasks();
    }
  };

  const retryTask = async (taskId: string) => {
    const { error } = await supabase
      .from('agent_queue')
      .update({ 
        status: 'pending',
        retry_count: 0,
        started_at: null,
        completed_at: null,
        error_message: null
      })
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to retry task',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Task queued for retry'
      });
      fetchTasks();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      in_progress: { variant: 'default', icon: Loader2 },
      completed: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      cancelled: { variant: 'outline', icon: X }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) return <Badge variant="destructive">High</Badge>;
    if (priority <= 6) return <Badge variant="default">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const formatTaskType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage automated compliance tasks</p>
        </div>
        <Button onClick={runAgentNow} disabled={runningAgent}>
          {runningAgent ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Agent Now
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Task Queue</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>
                Tasks currently in the queue or being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {formatTaskType(task.task_type)}
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(task.scheduled_for)}
                      </TableCell>
                      <TableCell>
                        {task.retry_count}/{task.max_retries}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(task.status === 'failed' || task.status === 'cancelled') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryTask(task.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          {(task.status === 'pending' || task.status === 'in_progress') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => cancelTask(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task History</CardTitle>
              <CardDescription>
                Recently completed or failed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {formatTaskType(item.task_type)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.execution_time_ms 
                          ? `${(item.execution_time_ms / 1000).toFixed(2)}s`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;