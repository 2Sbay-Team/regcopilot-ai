import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Shield, FileText, Leaf, Network, Lock, Gavel, Settings, Save } from "lucide-react";
import { Label } from "@/components/ui/label";

const modules = [
  {
    name: 'ai_act',
    title: 'EU AI Act Auditor',
    icon: Shield,
    description: 'AI system risk classification and conformity assessment',
    color: 'text-blue-600',
  },
  {
    name: 'gdpr',
    title: 'GDPR Privacy Checker',
    icon: Lock,
    description: 'Data privacy scanning and DSAR management',
    color: 'text-purple-600',
  },
  {
    name: 'esg',
    title: 'ESG Reporter',
    icon: Leaf,
    description: 'Sustainability reporting (CSRD/ESRS)',
    color: 'text-green-600',
  },
  {
    name: 'nis2',
    title: 'NIS2 Assessor',
    icon: Network,
    description: 'Network and information security compliance',
    color: 'text-red-600',
  },
  {
    name: 'dora',
    title: 'DORA Assessor',
    icon: FileText,
    description: 'Digital operational resilience for financial entities',
    color: 'text-yellow-600',
  },
  {
    name: 'dma',
    title: 'DMA Assessor',
    icon: Gavel,
    description: 'Digital Markets Act compliance for gatekeepers',
    color: 'text-orange-600',
  },
];

export default function ModuleManagement() {
  const { user } = useAuth();
  const [config, setConfig] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>('');

  useEffect(() => {
    fetchModuleConfig();
  }, []);

  const fetchModuleConfig = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      if (!profile) return;
      setOrganizationId(profile.organization_id);

      const { data, error } = await supabase
        .from('module_configuration' as any)
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      const configMap: Record<string, boolean> = {};
      modules.forEach(module => {
        const found = (data as any[])?.find((d: any) => d.module_name === module.name);
        configMap[module.name] = found?.enabled ?? true; // Default to enabled
      });

      setConfig(configMap);
    } catch (error) {
      console.error('Error fetching module config:', error);
    }
  };

  const toggleModule = (moduleName: string) => {
    setConfig(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      // Upsert each module configuration
      const updates = modules.map(module => ({
        organization_id: organizationId,
        module_name: module.name,
        enabled: config[module.name] ?? true,
        configuration: {},
        feature_flags: {},
      }));

      const { error } = await supabase
        .from('module_configuration' as any)
        .upsert(updates as any, { onConflict: 'organization_id,module_name' });

      if (error) throw error;

      toast.success('Module configuration saved');
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">Enable or disable compliance modules for your organization</p>
        </div>
        <Button onClick={saveConfiguration} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isEnabled = config[module.name] ?? true;

          return (
            <Card key={module.name} className={!isEnabled ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-8 w-8 ${module.color}`} />
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleModule(module.name)}
                  />
                </div>
                <CardDescription className="mt-2">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={isEnabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {isEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Additional configuration options for each module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <Label className="text-sm font-medium">Module Dependencies</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Some modules depend on others. Disabling a core module may affect dependent features.
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• AI Act Auditor requires Model Registry</li>
              <li>• ESG Reporter requires Data Lineage</li>
              <li>• All modules require Audit Trail</li>
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <Label className="text-sm font-medium">Performance Impact</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Disabling unused modules can improve system performance and reduce costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}