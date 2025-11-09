import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, Plus, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

const ModelRegistry = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    provider: "",
    model_type: "",
    risk_tag: "minimal",
    dataset_ref: "",
    compliance_status: "pending"
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadModels()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const loadModels = async () => {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
      return
    }

    setModels(data || [])
  }

  const registerModel = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('ai_models')
        .insert({
          ...formData,
          organization_id: profile.organization_id,
          registered_by: user?.id
        })

      if (error) throw error

      // Log audit entry
      await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        actor_id: user?.id,
        agent: 'model_registry',
        event_type: 'model.registered',
        action: 'register',
        status: 'success',
        input_hash: formData.name,
        output_hash: '',
        request_payload: formData
      })

      toast({
        title: "Success",
        description: "Model registered successfully"
      })

      setIsDialogOpen(false)
      setFormData({
        name: "",
        version: "",
        provider: "",
        model_type: "",
        risk_tag: "minimal",
        dataset_ref: "",
        compliance_status: "pending"
      })
      loadModels()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteModel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return

    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
      return
    }

    toast({
      title: "Success",
      description: "Model deleted successfully"
    })

    loadModels()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRiskBadgeVariant = (risk: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (risk) {
      case 'minimal':
        return 'default'
      case 'limited':
        return 'secondary'
      case 'high':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Model Registry
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage AI models, track versions, and monitor compliance status
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Register Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New AI Model</DialogTitle>
              <DialogDescription>
                Add a new AI model to your organization's registry
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Model Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., GPT-4o-mini"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <select
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="">Select provider</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Google">Google (Gemini)</option>
                    <option value="Anthropic">Anthropic</option>
                    <option value="Mistral">Mistral</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_type">Model Type</Label>
                  <select
                    id="model_type"
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="">Select type</option>
                    <option value="chat">Chat / Completion</option>
                    <option value="embedding">Embedding</option>
                    <option value="classification">Classification</option>
                    <option value="vision">Vision</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="risk_tag">EU AI Act Risk Tag</Label>
                  <select
                    id="risk_tag"
                    value={formData.risk_tag}
                    onChange={(e) => setFormData({ ...formData, risk_tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="minimal">Minimal Risk</option>
                    <option value="limited">Limited Risk</option>
                    <option value="high">High Risk</option>
                    <option value="unacceptable">Unacceptable Risk</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compliance_status">Compliance Status</Label>
                  <select
                    id="compliance_status"
                    value={formData.compliance_status}
                    onChange={(e) => setFormData({ ...formData, compliance_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="passed">Passed</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataset_ref">Dataset Reference</Label>
                <Input
                  id="dataset_ref"
                  value={formData.dataset_ref}
                  onChange={(e) => setFormData({ ...formData, dataset_ref: e.target.value })}
                  placeholder="URL or path to training dataset"
                />
              </div>
            </div>

            <Button onClick={registerModel} disabled={loading || !formData.name}>
              {loading ? "Registering..." : "Register Model"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Registered Models
          </CardTitle>
          <CardDescription>
            {models.length} model{models.length !== 1 ? 's' : ''} in registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Risk Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.version || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{model.provider || 'Unknown'}</TableCell>
                    <TableCell>{model.model_type || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(model.risk_tag)}>
                        {model.risk_tag || 'Not set'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(model.compliance_status)}
                        <span className="capitalize">{model.compliance_status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(model.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteModel(model.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No models registered yet</p>
              <p className="text-sm">Click "Register Model" to add your first AI model</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ModelRegistry