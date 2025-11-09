import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bot, Plus, TrendingUp, DollarSign, Zap, Search, Filter, ArrowUpDown, Trash2, Power, PowerOff, CheckSquare } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MODEL_PROVIDERS, getProviderModels, type ModelInfo } from "@/lib/modelProviders"
import { ModelInfoCard } from "@/components/ModelInfoCard"

const AVAILABLE_MODELS = [
  { name: 'google/gemini-2.5-pro', provider: 'Google', price: 0.30 },
  { name: 'google/gemini-2.5-flash', provider: 'Google', price: 0.05 },
  { name: 'google/gemini-2.5-flash-lite', provider: 'Google', price: 0.01 },
  { name: 'openai/gpt-5', provider: 'OpenAI', price: 0.30 },
  { name: 'openai/gpt-5-mini', provider: 'OpenAI', price: 0.10 },
  { name: 'openai/gpt-5-nano', provider: 'OpenAI', price: 0.03 },
  { name: 'mistralai/mistral-large-2', provider: 'Mistral', price: 0.15 },
  { name: 'deepseek/deepseek-chat', provider: 'DeepSeek', price: 0.08 },
  { name: 'anthropic/claude-3.5-sonnet', provider: 'Anthropic', price: 0.25 },
  { name: 'x-ai/grok-2', provider: 'xAI', price: 0.20 },
]

const ModelManagement = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'provider' | 'price' | 'date'>('date')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const [newModel, setNewModel] = useState({
    provider: '',
    model_name: '',
    base_url: '',
    api_key_ref: '',
    price_per_1k_tokens: 0,
  })
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const [selectedModelInfo, setSelectedModelInfo] = useState<ModelInfo | null>(null)

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
    const { data } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
    setProfile(data)
  }

  const loadModels = async () => {
    const { data } = await supabase
      .from('model_configs')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    setModels(data || [])
  }

  const handleProviderChange = (providerId: string) => {
    setNewModel({ ...newModel, provider: providerId, model_name: '' })
    setSelectedModelInfo(null)
    const models = getProviderModels(providerId)
    setAvailableModels(models)
  }

  const handleModelChange = (modelId: string) => {
    const modelInfo = availableModels.find(m => m.id === modelId)
    if (modelInfo) {
      setNewModel({
        ...newModel,
        model_name: modelInfo.id,
        price_per_1k_tokens: (modelInfo.inputPricePerMillion + modelInfo.outputPricePerMillion) / 2 / 1000,
      })
      setSelectedModelInfo(modelInfo)
    }
  }

  const addModel = async () => {
    if (!newModel.provider || !newModel.model_name) {
      toast({ 
        variant: "destructive", 
        title: "Missing Information", 
        description: "Please select both provider and model" 
      })
      return
    }

    setLoading(true)
    try {
      const provider = MODEL_PROVIDERS.find(p => p.id === newModel.provider)
      
      const { error } = await supabase.from('model_configs').insert({
        organization_id: profile.organization_id,
        model_name: newModel.model_name,
        provider: provider?.name || newModel.provider,
        base_url: provider?.apiEndpoint || newModel.base_url || null,
        api_key_ref: newModel.api_key_ref || null,
        price_per_1k_tokens: newModel.price_per_1k_tokens,
        active: true,
      })

      if (error) throw error

      toast({ title: "Model Added", description: "Model configuration saved successfully" })
      setIsDialogOpen(false)
      setNewModel({ provider: '', model_name: '', base_url: '', api_key_ref: '', price_per_1k_tokens: 0 })
      setSelectedModelInfo(null)
      setAvailableModels([])
      loadModels()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const toggleModel = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('model_configs')
      .update({ active: !active })
      .eq('id', id)

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } else {
      loadModels()
    }
  }

  const toggleSelectedModels = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  const selectAllModels = (filteredModels: any[]) => {
    if (selectedModels.length === filteredModels.length) {
      setSelectedModels([])
    } else {
      setSelectedModels(filteredModels.map(m => m.id))
    }
  }

  const bulkActivate = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('model_configs')
        .update({ active: true })
        .in('id', selectedModels)

      if (error) throw error

      toast({ title: "Success", description: `Activated ${selectedModels.length} model(s)` })
      setSelectedModels([])
      loadModels()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const bulkDeactivate = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('model_configs')
        .update({ active: false })
        .in('id', selectedModels)

      if (error) throw error

      toast({ title: "Success", description: `Deactivated ${selectedModels.length} model(s)` })
      setSelectedModels([])
      loadModels()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const bulkDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('model_configs')
        .delete()
        .in('id', selectedModels)

      if (error) throw error

      toast({ title: "Success", description: `Deleted ${selectedModels.length} model(s)` })
      setSelectedModels([])
      setShowDeleteDialog(false)
      loadModels()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedModels = models
    .filter(model => {
      const matchesSearch = searchQuery === '' || 
        model.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && model.active) ||
        (statusFilter === 'inactive' && !model.active)
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.model_name.localeCompare(b.model_name)
        case 'provider':
          return a.provider.localeCompare(b.provider)
        case 'price':
          return a.price_per_1k_tokens - b.price_per_1k_tokens
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Model Management
          </h1>
          <p className="text-muted-foreground font-medium">Configure and manage AI models for your copilots</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add AI Model</DialogTitle>
              <DialogDescription>Select a provider and model to configure for your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={newModel.provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {MODEL_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <img src={provider.logo} alt={provider.name} className="w-4 h-4" />
                          <span>{provider.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {provider.flag} {provider.headquarters}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={newModel.model_name} onValueChange={handleModelChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground ml-4">
                              {model.releaseDate}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Model Info Card */}
              {selectedModelInfo && (
                <ModelInfoCard model={selectedModelInfo} />
              )}

              {/* Optional Configuration */}
              {newModel.model_name && (
                <>
                  <div className="space-y-2">
                    <Label>Custom Endpoint (Optional)</Label>
                    <Input
                      placeholder="https://api.example.com/v1"
                      value={newModel.base_url}
                      onChange={(e) => setNewModel({ ...newModel, base_url: e.target.value })}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use default endpoint
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key Reference (Optional)</Label>
                    <Input
                      placeholder="e.g., OPENAI_API_KEY"
                      value={newModel.api_key_ref}
                      onChange={(e) => setNewModel({ ...newModel, api_key_ref: e.target.value })}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Environment variable name for the API key
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false)
                setNewModel({ provider: '', model_name: '', base_url: '', api_key_ref: '', price_per_1k_tokens: 0 })
                setSelectedModelInfo(null)
                setAvailableModels([])
              }}>
                Cancel
              </Button>
              <Button 
                onClick={addModel} 
                disabled={loading || !newModel.provider || !newModel.model_name}
              >
                Add Model
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Sort
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Date Added
                    </div>
                  </SelectItem>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Name
                    </div>
                  </SelectItem>
                  <SelectItem value="provider">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Provider
                    </div>
                  </SelectItem>
                  <SelectItem value="price">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Price
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModels.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <p className="font-medium">
                  {selectedModels.length} model(s) selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkActivate}
                  disabled={loading}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDeactivate}
                  disabled={loading}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAndSortedModels.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedModels.length === filteredAndSortedModels.length}
            onCheckedChange={() => selectAllModels(filteredAndSortedModels)}
          />
          <Label className="text-sm cursor-pointer" onClick={() => selectAllModels(filteredAndSortedModels)}>
            Select all {filteredAndSortedModels.length} model(s)
          </Label>
        </div>
      )}

      <div className="grid gap-6">
        {filteredAndSortedModels.map((model) => (
          <Card key={model.id} className={selectedModels.includes(model.id) ? 'border-primary' : model.active ? 'border-primary/20' : 'border-muted'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => toggleSelectedModels(model.id)}
                  />
                  <Bot className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {model.model_name}
                      {model.active && <Badge variant="default">Active</Badge>}
                    </CardTitle>
                    <CardDescription>{model.provider}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={model.active}
                  onCheckedChange={() => toggleModel(model.id, model.active)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">${model.price_per_1k_tokens}/1K tokens</p>
                    <p className="text-xs text-muted-foreground">Cost per 1K tokens</p>
                  </div>
                </div>
                {model.base_url && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Custom Endpoint</p>
                      <p className="text-xs text-muted-foreground truncate">{model.base_url}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAndSortedModels.length === 0 && models.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No models match your filters</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}

        {models.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No models configured yet</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Add your first AI model to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Models</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedModels.length} model(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ModelManagement
