import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  RefreshCw, 
  Play, 
  Trash2, 
  Settings, 
  Database,
  Cloud,
  FileText,
  MessageSquare,
  Rss,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const connectorIcons = {
  sap: Database,
  sharepoint: FileText,
  onedrive: Cloud,
  aws_s3: Cloud,
  azure_blob: Cloud,
  jira: FileText,
  slack: MessageSquare,
  teams: MessageSquare,
  rss_feed: Rss,
  linkedin: MessageSquare,
  glassdoor: MessageSquare,
};

const Connectors = () => {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConnector, setShowNewConnector] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sync_frequency: 'daily',
    config: {}
  });

  const fetchConnectors = async () => {
    try {
      const { data, error } = await supabase
        .from('connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnectors(data || []);
    } catch (error: any) {
      console.error('Error fetching connectors:', error);
      toast.error('Failed to load connectors');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async (connectorId: string) => {
    try {
      toast.info('Starting sync...');
      const { error } = await supabase.functions.invoke('connector-sync', {
        body: { connector_id: connectorId }
      });

      if (error) throw error;
      
      toast.success('Sync completed successfully');
      await fetchConnectors();
    } catch (error: any) {
      console.error('Error triggering sync:', error);
      toast.error('Sync failed: ' + error.message);
    }
  };

  const deleteConnector = async (connectorId: string) => {
    if (!confirm('Are you sure you want to delete this connector?')) return;

    try {
      const { error } = await supabase
        .from('connectors')
        .delete()
        .eq('id', connectorId);

      if (error) throw error;
      
      toast.success('Connector deleted');
      await fetchConnectors();
    } catch (error: any) {
      console.error('Error deleting connector:', error);
      toast.error('Failed to delete connector');
    }
  };

  const createConnector = async () => {
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('Not authenticated');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', profile.user.id)
        .single();

      if (!profileData) throw new Error('Profile not found');

      const { error } = await supabase
        .from('connectors')
        .insert({
          organization_id: profileData.organization_id,
          connector_type: selectedType as any,
          name: formData.name,
          description: formData.description,
          sync_frequency: formData.sync_frequency as any,
          config: formData.config as any,
          created_by: profile.user.id
        } as any);

      if (error) throw error;
      
      toast.success('Connector created');
      setShowNewConnector(false);
      await fetchConnectors();
    } catch (error: any) {
      console.error('Error creating connector:', error);
      toast.error('Failed to create connector: ' + error.message);
    }
  };

  useEffect(() => {
    fetchConnectors();

    // Real-time subscription
    const channel = supabase
      .channel('connectors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connectors' }, () => {
        fetchConnectors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
      inactive: { variant: 'secondary' as const, icon: Clock, className: '' },
      error: { variant: 'destructive' as const, icon: XCircle, className: '' },
      configuring: { variant: 'outline' as const, icon: AlertCircle, className: '' }
    };

    const config = configs[status as keyof typeof configs] || configs.configuring;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className || ''}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const renderConfigFields = () => {
    const configs: Record<string, any> = {
      aws_s3: (
        <>
          <div className="space-y-2">
            <Label>S3 Bucket Name</Label>
            <Input 
              placeholder="my-bucket" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, bucket: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>AWS Region</Label>
            <Input 
              placeholder="us-east-1" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, region: e.target.value }
              })}
            />
          </div>
        </>
      ),
      azure_blob: (
        <>
          <div className="space-y-2">
            <Label>Storage Account</Label>
            <Input 
              placeholder="mystorageaccount" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, storage_account: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Container Name</Label>
            <Input 
              placeholder="mycontainer" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, container: e.target.value }
              })}
            />
          </div>
        </>
      ),
      sharepoint: (
        <>
          <div className="space-y-2">
            <Label>Site URL</Label>
            <Input 
              placeholder="https://company.sharepoint.com/sites/mysite" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, site_url: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Document Library</Label>
            <Input 
              placeholder="Documents" 
              defaultValue="Documents"
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, library: e.target.value }
              })}
            />
          </div>
        </>
      ),
      onedrive: (
        <div className="space-y-2">
          <Label>Folder Path</Label>
          <Input 
            placeholder="/Compliance Documents" 
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, folder_path: e.target.value }
            })}
          />
        </div>
      ),
      sap: (
        <>
          <div className="space-y-2">
            <Label>SAP API URL</Label>
            <Input 
              placeholder="https://sap.company.com:8000" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, api_url: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>System ID</Label>
            <Input 
              placeholder="PRD" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, system_id: e.target.value }
              })}
            />
          </div>
        </>
      ),
      jira: (
        <>
          <div className="space-y-2">
            <Label>Jira URL</Label>
            <Input 
              placeholder="https://company.atlassian.net" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, jira_url: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Project Key</Label>
            <Input 
              placeholder="COMP" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, project_key: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              placeholder="user@company.com" 
              type="email"
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, email: e.target.value }
              })}
            />
          </div>
        </>
      ),
      slack: (
        <div className="space-y-2">
          <Label>Channel ID</Label>
          <Input 
            placeholder="C1234567890" 
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, channel_id: e.target.value }
            })}
          />
        </div>
      ),
      teams: (
        <>
          <div className="space-y-2">
            <Label>Team ID</Label>
            <Input 
              placeholder="team-id-here" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, team_id: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Channel ID</Label>
            <Input 
              placeholder="channel-id-here" 
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, channel_id: e.target.value }
              })}
            />
          </div>
        </>
      ),
      rss_feed: (
        <div className="space-y-2">
          <Label>Feed URL</Label>
          <Input 
            placeholder="https://example.com/feed.xml" 
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, feed_url: e.target.value }
            })}
          />
        </div>
      )
    };

    return configs[selectedType] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enterprise Connectors</h1>
            <p className="text-muted-foreground mt-1">Connect to external data sources for automated compliance monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchConnectors} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showNewConnector} onOpenChange={setShowNewConnector}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Connector
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Connector</DialogTitle>
                  <DialogDescription>
                    Connect to an external data source to automate compliance monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Connector Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select connector type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws_s3">AWS S3</SelectItem>
                        <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
                        <SelectItem value="sharepoint">SharePoint</SelectItem>
                        <SelectItem value="onedrive">OneDrive</SelectItem>
                        <SelectItem value="sap">SAP / ERP</SelectItem>
                        <SelectItem value="jira">Jira</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="rss_feed">RSS Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedType && (
                    <>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder={
                            selectedType === 'aws_s3' ? 'Production S3 Bucket' :
                            selectedType === 'azure_blob' ? 'Production Azure Container' :
                            selectedType === 'sharepoint' ? 'HR SharePoint Site' :
                            selectedType === 'onedrive' ? 'Compliance OneDrive' :
                            selectedType === 'sap' ? 'SAP Production System' :
                            selectedType === 'jira' ? 'Compliance Jira Project' :
                            selectedType === 'slack' ? 'Legal Slack Channel' :
                            selectedType === 'teams' ? 'Compliance Teams Channel' :
                            selectedType === 'rss_feed' ? 'Regulatory News Feed' :
                            'My Connector'
                          }
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Compliance documents from production environment"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sync Frequency</Label>
                        <Select 
                          value={formData.sync_frequency} 
                          onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="manual">Manual Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {renderConfigFields()}

                      <Button onClick={createConnector} className="w-full">
                        Create Connector
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {connectors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No connectors configured yet. Click "New Connector" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((connector) => {
              const Icon = connectorIcons[connector.connector_type as keyof typeof connectorIcons] || Database;
              
              return (
                <Card key={connector.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{connector.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {connector.connector_type.replace(/_/g, ' ').toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(connector.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{connector.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sync:</span>
                      <Badge variant="outline">{connector.sync_frequency}</Badge>
                    </div>

                    {connector.last_sync_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="text-xs">
                          {format(new Date(connector.last_sync_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => triggerSync(connector.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteConnector(connector.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connectors;