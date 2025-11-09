import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InfoModal } from "@/components/InfoModal"
import { Database, Plus, Trash2, CheckCircle, Clock, AlertTriangle, Info, FileText } from "lucide-react"
import { format } from "date-fns"
import { ModuleLayout } from "@/components/ModuleLayout"

const ModelRegistry = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
    // Validate inputs
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Model name is required"
      })
      return
    }

    if (formData.name.length > 100) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Model name must be less than 100 characters"
      })
      return
    }

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
    <ModuleLayout
      title="Model Registry"
      description="Manage AI models, track versions, and monitor compliance status"
      quickActions={[
        {
          label: "Berichte",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => navigate("/reports"),
          variant: "outline"
        }
      ]}
    >
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New AI Model</DialogTitle>
              <DialogDescription>
                Add a new AI model to your organization's registry for compliance tracking
              </DialogDescription>
            </DialogHeader>

            {/* Help Section */}
            <Alert className="bg-muted/50 border-border">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Register AI models to track their compliance status, risk classification, and usage across your organization. This helps ensure EU AI Act compliance and proper model governance.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="name">Model Name *</Label>
                    <InfoModal 
                      title="Model Name"
                      description="The official name or identifier of the AI model. This should be unique and clearly identify the model."
                      example="Examples:\n• GPT-4o\n• Gemini-2.5-Pro\n• Claude-3.5-Sonnet\n• Custom-Sentiment-Analyzer-v2"
                    />
                  </div>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., GPT-4o-mini"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="version">Version</Label>
                    <InfoModal 
                      title="Model Version"
                      description="Track different versions of the same model for proper versioning and audit trails."
                      example="Examples:\n• 1.0.0\n• 2.5.1\n• 2024-11-20\n• beta-3"
                    />
                  </div>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 1.0.0"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="provider">Provider</Label>
                    <InfoModal 
                      title="Model Provider"
                      description="The company or organization that developed and provides this AI model."
                      example="Select from major providers like OpenAI, Google, Anthropic, Mistral, or choose 'Custom' for internally developed models."
                    />
                  </div>
                  <select
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="">Select provider</option>
                    <option value="OpenAI">OpenAI</option>
                    <option value="Google">Google (Gemini)</option>
                    <option value="Anthropic">Anthropic (Claude)</option>
                    <option value="Mistral">Mistral AI</option>
                    <option value="Custom">Custom / In-house</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="model_type">Model Type</Label>
                    <InfoModal 
                      title="Model Type"
                      description="The primary capability or use case of this AI model."
                      example="• Chat/Completion: Text generation, conversations\n• Embedding: Vector representations for search\n• Classification: Categorization tasks\n• Vision: Image analysis and understanding"
                    />
                  </div>
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
                    <option value="vision">Vision / Image Analysis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="risk_tag">EU AI Act Risk Tag</Label>
                    <InfoModal 
                      title="EU AI Act Risk Classification"
                      description="Classify the AI model's risk level according to the EU AI Act requirements. This determines compliance obligations."
                      example="• Minimal: Most AI systems (chatbots, spam filters)\n• Limited: Systems with transparency obligations\n• High: Critical infrastructure, employment decisions\n• Unacceptable: Social scoring, real-time biometric ID"
                    />
                  </div>
                  <select
                    id="risk_tag"
                    value={formData.risk_tag}
                    onChange={(e) => setFormData({ ...formData, risk_tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="minimal">Minimal Risk</option>
                    <option value="limited">Limited Risk (Transparency required)</option>
                    <option value="high">High Risk (Strict requirements)</option>
                    <option value="unacceptable">Unacceptable Risk (Prohibited)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="compliance_status">Compliance Status</Label>
                    <InfoModal 
                      title="Compliance Status"
                      description="Track the current compliance review status of this model."
                      example="• Pending: Awaiting compliance review\n• Passed: Approved for use\n• Flagged: Requires attention or remediation"
                    />
                  </div>
                  <select
                    id="compliance_status"
                    value={formData.compliance_status}
                    onChange={(e) => setFormData({ ...formData, compliance_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="passed">Passed</option>
                    <option value="flagged">Flagged for Review</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="dataset_ref">Dataset Reference</Label>
                  <InfoModal 
                    title="Dataset Reference"
                    description="Optional: Link to the training dataset or documentation. Important for high-risk AI systems to demonstrate compliance."
                    example="Examples:\n• https://huggingface.co/datasets/my-dataset\n• s3://my-bucket/training-data/\n• Internal dataset ID: DS-2024-001"
                  />
                </div>
                <Input
                  id="dataset_ref"
                  value={formData.dataset_ref}
                  onChange={(e) => setFormData({ ...formData, dataset_ref: e.target.value })}
                  placeholder="e.g., https://huggingface.co/datasets/... or internal reference"
                  maxLength={500}
                />
              </div>
            </div>

            <Button onClick={registerModel} disabled={loading || !formData.name}>
              {loading ? "Registering..." : "Register Model"}
            </Button>
          </DialogContent>
        </Dialog>

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
    </ModuleLayout>
  )
}

export default ModelRegistry