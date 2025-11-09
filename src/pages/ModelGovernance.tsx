// ============================================================================
// PHASE 3: Admin Panel for AI Gateway Configuration
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, TestTube, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ModelConfig {
  id: string;
  config_name: string;
  model_type: 'chat' | 'embedding';
  provider: string;
  model_name: string;
  fallback_provider: string | null;
  fallback_model_name: string | null;
  max_timeout_ms: number;
  cost_per_1k_tokens: number;
  active: boolean;
  task_types: string[];
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  { value: 'google', label: 'Google AI' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'lovable', label: 'Lovable AI' }
];

const CHAT_MODELS = {
  google: ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite'],
  openai: ['openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano'],
  lovable: ['google/gemini-2.5-flash']
};

const EMBEDDING_MODELS = {
  google: ['text-embedding-004'],
  openai: ['text-embedding-3-small', 'text-embedding-3-large']
};

const TASK_TYPES = [
  'default', 'ai_act', 'gdpr', 'esg', 'dma', 'dora', 'nis2', 'rag', 'search'
];

export default function ModelGovernance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<Partial<ModelConfig> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrganization();
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      loadConfigs();
    }
  }, [organizationId]);

  const loadOrganization = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load organization",
        variant: "destructive"
      });
    } else if (data) {
      setOrganizationId(data.organization_id);
    }
  };

  const loadConfigs = async () => {
    if (!organizationId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('model_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load model configurations",
        variant: "destructive"
      });
    } else {
      setConfigs((data || []) as unknown as ModelConfig[]);
    }
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    if (!organizationId || !editingConfig) return;

    const configData = {
      ...editingConfig,
      organization_id: organizationId,
      updated_at: new Date().toISOString()
    };

    if (isCreating) {
      const { error } = await supabase
        .from('model_configs')
        .insert([configData as any]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: "Model configuration created" });
        setIsCreating(false);
        setEditingConfig(null);
        loadConfigs();
      }
    } else {
      const { error } = await supabase
        .from('model_configs')
        .update(configData as any)
        .eq('id', editingConfig.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Success", description: "Model configuration updated" });
        setEditingConfig(null);
        loadConfigs();
      }
    }
  };

  const handleTestConnection = async () => {
    if (!editingConfig?.provider || !editingConfig?.model_name) {
      toast({
        title: "Error",
        description: "Please configure provider and model first",
        variant: "destructive"
      });
      return;
    }

    setTestingConnection(true);
    
    // Simple test message
    const testMessages = [
      { role: 'system', content: 'You are a test assistant.' },
      { role: 'user', content: 'Respond with "OK" if you receive this.' }
    ];

    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          messages: testMessages,
          model: editingConfig.model_name,
          max_tokens: 10
        }
      });

      if (error) throw error;

      toast({
        title: "Connection Successful",
        description: `Model ${editingConfig.model_name} is accessible`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to model",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const startCreating = () => {
    setEditingConfig({
      config_name: '',
      model_type: 'chat',
      provider: 'google',
      model_name: 'google/gemini-2.5-flash',
      fallback_provider: 'google',
      fallback_model_name: 'google/gemini-2.5-flash-lite',
      max_timeout_ms: 6000,
      cost_per_1k_tokens: 0.05,
      active: true,
      task_types: ['default']
    });
    setIsCreating(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            AI Gateway Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage LLM models, fallback settings, and cost controls
          </p>
        </div>
        <Button onClick={startCreating} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      <Tabs defaultValue="configs" className="w-full">
        <TabsList>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          {(isCreating || editingConfig) && (
            <Card>
              <CardHeader>
                <CardTitle>{isCreating ? 'Create' : 'Edit'} Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Configuration Name</Label>
                    <Input
                      value={editingConfig?.config_name || ''}
                      onChange={(e) => setEditingConfig({ ...editingConfig, config_name: e.target.value })}
                      placeholder="e.g., Production Chat Model"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Model Type</Label>
                    <RadioGroup
                      value={editingConfig?.model_type || 'chat'}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, model_type: value as 'chat' | 'embedding' })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="chat" id="chat" />
                        <Label htmlFor="chat">Chat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="embedding" id="embedding" />
                        <Label htmlFor="embedding">Embedding</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Provider</Label>
                    <Select
                      value={editingConfig?.provider}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Model</Label>
                    <Select
                      value={editingConfig?.model_name}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, model_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {editingConfig?.model_type === 'chat'
                          ? CHAT_MODELS[editingConfig?.provider as keyof typeof CHAT_MODELS]?.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))
                          : EMBEDDING_MODELS[editingConfig?.provider as keyof typeof EMBEDDING_MODELS]?.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fallback Provider</Label>
                    <Select
                      value={editingConfig?.fallback_provider || ''}
                      onValueChange={(value) => setEditingConfig({ ...editingConfig, fallback_provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fallback provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fallback Model</Label>
                    <Input
                      value={editingConfig?.fallback_model_name || ''}
                      onChange={(e) => setEditingConfig({ ...editingConfig, fallback_model_name: e.target.value })}
                      placeholder="e.g., google/gemini-2.5-flash-lite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={editingConfig?.max_timeout_ms || 6000}
                      onChange={(e) => setEditingConfig({ ...editingConfig, max_timeout_ms: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cost per 1K tokens (USD)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={editingConfig?.cost_per_1k_tokens || 0.05}
                      onChange={(e) => setEditingConfig({ ...editingConfig, cost_per_1k_tokens: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Task Types (select applicable)</Label>
                  <div className="flex flex-wrap gap-2">
                    {TASK_TYPES.map(taskType => (
                      <Badge
                        key={taskType}
                        variant={editingConfig?.task_types?.includes(taskType) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = editingConfig?.task_types || [];
                          const updated = current.includes(taskType)
                            ? current.filter(t => t !== taskType)
                            : [...current, taskType];
                          setEditingConfig({ ...editingConfig, task_types: updated });
                        }}
                      >
                        {taskType}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingConfig?.active || false}
                    onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveConfig}>
                    Save Configuration
                  </Button>
                  <Button onClick={handleTestConnection} variant="outline" disabled={testingConnection}>
                    <TestTube className="mr-2 h-4 w-4" />
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingConfig(null);
                      setIsCreating(false);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">Loading configurations...</CardContent>
              </Card>
            ) : configs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No model configurations yet. Click "Add Configuration" to create one.
                </CardContent>
              </Card>
            ) : (
              configs.map(config => (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.config_name}
                          {config.active && (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          )}
                          <Badge variant="outline">{config.model_type}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {config.provider}/{config.model_name}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingConfig(config)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Fallback:</span>{' '}
                        {config.fallback_provider ? `${config.fallback_provider}/${config.fallback_model_name}` : 'None'}
                      </div>
                      <div>
                        <span className="font-medium">Timeout:</span> {config.max_timeout_ms}ms
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${config.cost_per_1k_tokens}/1K tokens
                      </div>
                      <div>
                        <span className="font-medium">Tasks:</span>{' '}
                        {config.task_types.map(t => (
                          <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                LLM Usage & Reliability Analytics
              </CardTitle>
              <CardDescription>
                Coming in Phase 5 - Real-time monitoring of model performance and costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Analytics dashboard will show: Active provider, Fallback rate, Average latency, 
                  Monthly cost estimate, Token consumption per module, and alerts when fallback exceeds 10% in 24h.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration Audit Log</CardTitle>
              <CardDescription>
                All configuration changes are automatically logged for compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View audit logs in the main Audit Trail page, filtered by event_type='model_config_update'
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
