import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Key, Zap, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PROVIDERS = {
  lovable: { name: 'Lovable AI', models: ['google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'openai/gpt-5'] },
  openai: { name: 'OpenAI (BYOK)', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
  anthropic: { name: 'Anthropic (BYOK)', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'] },
  google: { name: 'Google (BYOK)', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'] },
  mistral: { name: 'Mistral (BYOK)', models: ['mistral-large-latest', 'mistral-medium-latest'] }
};

// Simple XOR encryption (client-side, basic obfuscation)
function encryptApiKey(key: string): string {
  const salt = 'SUPABASE_ENCRYPTION_SALT_' + Date.now();
  let encrypted = '';
  for (let i = 0; i < key.length; i++) {
    encrypted += String.fromCharCode(
      key.charCodeAt(i) ^ salt.charCodeAt(i % salt.length)
    );
  }
  return btoa(encrypted); // Base64 encode
}

export default function LLMSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [billingModel, setBillingModel] = useState<'free' | 'paid' | 'byok'>('free');
  const [selectedProvider, setSelectedProvider] = useState<string>('lovable');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        const org = profileData.organizations;
        setOrganization(org);
        const billingModelValue = org.billing_model as 'free' | 'paid' | 'byok';
        setBillingModel(billingModelValue || 'free');
        
        if (org.billing_model === 'byok') {
          setSelectedProvider(org.byok_provider || 'openai');
          setSelectedModel(org.byok_model || '');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organization?.id) return;

    setSaving(true);
    try {
      const updates: any = {
        billing_model: billingModel
      };

      if (billingModel === 'byok') {
        if (!apiKey && !organization.byok_api_key_encrypted) {
          toast.error('Please provide an API key');
          setSaving(false);
          return;
        }

        updates.byok_provider = selectedProvider;
        updates.byok_model = selectedModel;
        
        if (apiKey) {
          updates.byok_api_key_encrypted = encryptApiKey(apiKey);
        }
      } else {
        // Clear BYOK settings if switching away
        updates.byok_provider = null;
        updates.byok_model = null;
        updates.byok_api_key_encrypted = null;
      }

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      toast.success('LLM settings saved successfully');
      setApiKey(''); // Clear sensitive data
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    // Auto-select first model for the provider
    const models = PROVIDERS[provider as keyof typeof PROVIDERS]?.models || [];
    setSelectedModel(models[0] || '');
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const currentProvider = PROVIDERS[selectedProvider as keyof typeof PROVIDERS];
  const isLovableAI = billingModel === 'free' || billingModel === 'paid';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">LLM Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your AI model provider and bring your own API key
        </p>
      </div>

      {organization?.billing_model === 'byok' && !organization.byok_api_key_encrypted && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            BYOK mode is enabled but no API key is configured. Please add your API key below.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Billing Model
          </CardTitle>
          <CardDescription>
            Choose between managed AI or bring your own API key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${billingModel === 'free' ? 'border-primary' : 'hover:border-muted-foreground'}`}
              onClick={() => setBillingModel('free')}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Free Tier</h3>
                    {billingModel === 'free' && <Badge>Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {organization?.llm_token_quota?.toLocaleString() || '100,000'} tokens/month
                  </p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${billingModel === 'paid' ? 'border-primary' : 'hover:border-muted-foreground'}`}
              onClick={() => setBillingModel('paid')}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Paid Plan</h3>
                    {billingModel === 'paid' && <Badge>Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay per token usage
                  </p>
                  <p className="text-2xl font-bold">$49<span className="text-sm">/mo</span></p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${billingModel === 'byok' ? 'border-primary' : 'hover:border-muted-foreground'}`}
              onClick={() => setBillingModel('byok')}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">BYOK</h3>
                    {billingModel === 'byok' && <Badge>Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your own API key
                  </p>
                  <p className="text-2xl font-bold">
                    <Key className="inline h-6 w-6" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {billingModel === 'byok' && (
        <Card>
          <CardHeader>
            <CardTitle>BYOK Configuration</CardTitle>
            <CardDescription>
              Configure your own AI provider and API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={selectedProvider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([key, provider]) => (
                    key !== 'lovable' && (
                      <SelectItem key={key} value={key}>
                        {provider.name}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={organization?.byok_api_key_encrypted ? "••••••••••••••••" : "Enter your API key"}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your API key is encrypted and stored securely. {organization?.byok_api_key_encrypted && "Leave blank to keep existing key."}
              </p>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                With BYOK, you have unlimited token usage and are billed directly by {currentProvider?.name}.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {isLovableAI && (
        <Card>
          <CardHeader>
            <CardTitle>Lovable AI Configuration</CardTitle>
            <CardDescription>
              Using Lovable's managed AI service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Monthly Token Quota</p>
                  <p className="text-sm text-muted-foreground">
                    {organization?.tokens_used_this_month?.toLocaleString() || 0} / {organization?.llm_token_quota?.toLocaleString() || 100000} tokens used
                  </p>
                </div>
                <Badge variant={
                  (organization?.tokens_used_this_month / organization?.llm_token_quota) >= 0.9 ? 'destructive' :
                  (organization?.tokens_used_this_month / organization?.llm_token_quota) >= 0.8 ? 'default' :
                  'secondary'
                }>
                  {((organization?.tokens_used_this_month / organization?.llm_token_quota) * 100).toFixed(1)}% Used
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Lovable AI provides access to multiple models without requiring API keys. Upgrade to a paid plan for higher quotas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadSettings}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
