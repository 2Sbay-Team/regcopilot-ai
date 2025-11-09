import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Clock, AlertCircle, MessageSquare, Plus, User } from "lucide-react"
import { format } from "date-fns"

interface TaskPanelProps {
  assessmentId: string
  assessmentType: 'ai_act' | 'gdpr' | 'esg'
}

export const TaskPanel = ({ assessmentId, assessmentType }: TaskPanelProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: ''
  })
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadTasks()
  }, [assessmentId])

  const loadTasks = async () => {
    const { data } = await supabase
      .from('assessment_tasks')
      .select(`
        *,
        task_comments(*, profiles(full_name)),
        profiles:assigned_to(full_name, email)
      `)
      .eq('assessment_id', assessmentId)
      .eq('assessment_type', assessmentType)
      .order('created_at', { ascending: false })

    setTasks(data || [])
  }

  const createTask = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('assessment_tasks').insert({
        assessment_id: assessmentId,
        assessment_type: assessmentType,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assigned_to: newTask.assigned_to || null,
      })

      if (error) throw error

      toast({ title: "Task Created", description: "Task added successfully" })
      setIsDialogOpen(false)
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '' })
      loadTasks()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase
      .from('assessment_tasks')
      .update({ status })
      .eq('id', taskId)

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } else {
      loadTasks()
    }
  }

  const addComment = async () => {
    if (!selectedTask || !comment.trim()) return

    const { error } = await supabase.from('task_comments').insert({
      task_id: selectedTask.id,
      user_id: user?.id,
      comment: comment.trim(),
    })

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } else {
      setComment('')
      loadTasks()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tasks & Collaboration
            </CardTitle>
            <CardDescription>Assign tasks and track progress</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Assign a task for this assessment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Review AI risk classification"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Detailed task description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(val) => setNewTask({ ...newTask, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={createTask} disabled={loading || !newTask.title}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="border-l-4" style={{ 
            borderLeftColor: task.priority === 'urgent' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' 
          }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  {task.description && (
                    <CardDescription className="text-sm">{task.description}</CardDescription>
                  )}
                </div>
                {getStatusIcon(task.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                {task.profiles && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    {task.profiles.full_name || task.profiles.email}
                  </div>
                )}
                <div className="text-muted-foreground">
                  {format(new Date(task.created_at), 'MMM dd')}
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={task.status}
                  onValueChange={(val) => updateTaskStatus(task.id, val)}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTask(task)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {task.task_comments?.length || 0} Comments
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks yet. Create one to get started.</p>
          </div>
        )}
      </CardContent>

      {/* Comments Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>Task comments and discussion</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedTask?.task_comments?.map((c: any) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(c.created_at), 'PPpp')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addComment} disabled={!comment.trim()}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
