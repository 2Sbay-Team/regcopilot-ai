import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RefreshCw, Play, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AgentTasks = () => {
  const [queueTasks, setQueueTasks] = useState<any[]>([]);
  const [historyTasks, setHistoryTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringAgent, setTriggeringAgent] = useState(false);

  const fetchTasks = async () => {
    try {
      // Fetch queue tasks
      const { data: queue, error: queueError } = await supabase
        .from('agent_queue')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(50);

      if (queueError) throw queueError;
      setQueueTasks(queue || []);

      // Fetch history
      const { data: history, error: historyError } = await supabase
        .from('agent_task_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (historyError) throw historyError;
      setHistoryTasks(history || []);

    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load agent tasks');
    } finally {
      setLoading(false);
    }
  };

  const triggerAgentManually = async () => {
    setTriggeringAgent(true);
    try {
      const { error } = await supabase.functions.invoke('agent-runner', {
        body: {}
      });

      if (error) throw error;
      
      toast.success('Agent triggered successfully');
      await fetchTasks();
    } catch (error: any) {
      console.error('Error triggering agent:', error);
      toast.error('Failed to trigger agent');
    } finally {
      setTriggeringAgent(false);
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('agent_queue')
        .update({ status: 'cancelled' })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task cancelled');
      await fetchTasks();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error('Failed to cancel task');
    }
  };

  useEffect(() => {
    fetchTasks();

    // Set up real-time subscription
    const channel = supabase
      .channel('agent_queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_queue' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      in_progress: { variant: 'default', icon: Loader2, text: 'In Progress' },
      completed: { variant: 'default', icon: CheckCircle2, text: 'Completed', className: 'bg-green-600' },
      failed: { variant: 'destructive', icon: XCircle, text: 'Failed' },
      cancelled: { variant: 'outline', icon: XCircle, text: 'Cancelled' }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) return <Badge variant="destructive">High</Badge>;
    if (priority <= 6) return <Badge variant="default">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const formatTaskType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agent Tasks</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage automated compliance tasks</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchTasks} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={triggerAgentManually} disabled={triggeringAgent} size="sm">
              <Play className="w-4 h-4 mr-2" />
              {triggeringAgent ? 'Triggering...' : 'Run Agent Now'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {queueTasks.filter(t => t.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {queueTasks.filter(t => t.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {historyTasks.filter(t => 
                  t.status === 'completed' && 
                  new Date(t.created_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Failed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {queueTasks.filter(t => t.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="w-full">
          <TabsList>
            <TabsTrigger value="queue">Active Queue</TabsTrigger>
            <TabsTrigger value="history">Task History</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>Task Queue</CardTitle>
                <CardDescription>Current tasks being processed by the agent</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No tasks in queue
                        </TableCell>
                      </TableRow>
                    ) : (
                      queueTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{formatTaskType(task.task_type)}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(task.scheduled_for), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.retry_count} / {task.max_retries}
                          </TableCell>
                          <TableCell>
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelTask(task.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>Completed and failed task records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead>Execution Time</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No task history
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{formatTaskType(task.task_type)}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(task.created_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {task.execution_time_ms ? `${(task.execution_time_ms / 1000).toFixed(2)}s` : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-red-600 max-w-xs truncate">
                            {task.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentTasks;