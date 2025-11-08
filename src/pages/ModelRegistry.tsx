import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Database, Plus } from "lucide-react"

const ModelRegistry = () => {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    model_type: "",
    framework: "",
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchModels()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate("/login")
    }
  }

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from("ml_models")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setModels(data || [])
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load models", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single()

      const { error } = await supabase.from("ml_models").insert({
        organization_id: profile?.organization_id,
        name: formData.name,
        version: formData.version,
        model_type: formData.model_type,
        framework: formData.framework,
        status: "registered",
      })

      if (error) throw error

      toast({ title: "Model registered", description: `${formData.name} v${formData.version}` })
      setOpen(false)
      setFormData({ name: "", version: "", model_type: "", framework: "" })
      fetchModels()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration failed", description: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Model Registry</h1>
              <p className="text-sm text-muted-foreground">AI/ML model governance</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Register Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Model</DialogTitle>
                <DialogDescription>Add a model to the compliance registry</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Model Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model_type">Model Type</Label>
                  <Input
                    id="model_type"
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                    placeholder="classification, regression, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Input
                    id="framework"
                    value={formData.framework}
                    onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                    placeholder="TensorFlow, PyTorch, etc."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Register</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registered Models</CardTitle>
            <CardDescription>Models tracked for EU AI Act compliance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : models.length === 0 ? (
              <p className="text-muted-foreground">No models registered yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell>{model.version}</TableCell>
                        <TableCell>{model.model_type}</TableCell>
                        <TableCell>{model.framework}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{model.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(model.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ModelRegistry
