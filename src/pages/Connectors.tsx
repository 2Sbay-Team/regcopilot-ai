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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { InfoModal } from '@/components/InfoModal';
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
  Clock,
  Info
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
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
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

  const validateConnector = async () => {
    setValidating(true);
    setValidationResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('connector-validate', {
        body: {
          connector_type: selectedType,
          config: formData.config
        }
      });

      if (error) throw error;
      
      setValidationResult(data);
      
      if (data.valid) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      const errorMessage = error.message || 'Validation failed';
      setValidationResult({ valid: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setValidating(false);
    }
  };

  const createConnector = async () => {
    // Validate inputs
    if (!formData.name.trim()) {
      toast.error('Connector name is required');
      return;
    }

    if (formData.name.length > 100) {
      toast.error('Connector name must be less than 100 characters');
      return;
    }

    // Validate before creating
    if (!validationResult?.valid) {
      toast.error('Please validate the connector configuration first');
      return;
    }

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
          created_by: profile.user.id,
          status: 'active'
        } as any);

      if (error) throw error;
      
      toast.success('Connector created successfully');
      setShowNewConnector(false);
      setValidationResult(null);
      setFormData({ name: '', description: '', sync_frequency: 'daily', config: {} });
      setSelectedType('');
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Connector</DialogTitle>
                  <DialogDescription>
                    Connect to an external data source to automate compliance monitoring
                  </DialogDescription>
                </DialogHeader>

                {/* Help Section */}
                <Alert className="bg-muted/50 border-border">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Connectors automatically sync data from external sources for compliance monitoring. Configure your connection details, test the connection, then create the connector for automated data syncing.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="connector-type">Connector Type</Label>
                      <InfoModal 
                        title="Connector Type"
                        description="Choose the type of external system you want to connect to. Each connector type is optimized for specific data sources and compliance scenarios."
                        example="• AWS S3: Cloud storage for documents and files\n• SharePoint: Corporate document management\n• SAP/ERP: Business process data\n• Jira: Project tracking and issues\n• Slack/Teams: Communication data for compliance"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger id="connector-type">
                        <SelectValue placeholder="Select connector type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws_s3">AWS S3 - Cloud Storage</SelectItem>
                        <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
                        <SelectItem value="sharepoint">SharePoint - Documents</SelectItem>
                        <SelectItem value="onedrive">OneDrive - Personal Files</SelectItem>
                        <SelectItem value="sap">SAP / ERP - Business Data</SelectItem>
                        <SelectItem value="jira">Jira - Project Tracking</SelectItem>
                        <SelectItem value="slack">Slack - Team Communication</SelectItem>
                        <SelectItem value="teams">Microsoft Teams - Collaboration</SelectItem>
                        <SelectItem value="rss_feed">RSS Feed - News & Updates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedType && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="connector-name">Connector Name</Label>
                          <InfoModal 
                            title="Connector Name"
                            description="A descriptive name to identify this connector in your dashboard. Use a name that clearly indicates the data source and purpose."
                            example="Examples:\n• Production S3 - GDPR Docs\n• HR SharePoint - Employee Data\n• Finance SAP - Audit Records\n• Compliance Jira - Regulatory Tasks"
                          />
                        </div>
                        <Input
                          id="connector-name"
                          placeholder={
                            selectedType === 'aws_s3' ? 'e.g., Production S3 Bucket' :
                            selectedType === 'azure_blob' ? 'e.g., Production Azure Container' :
                            selectedType === 'sharepoint' ? 'e.g., HR SharePoint Site' :
                            selectedType === 'onedrive' ? 'e.g., Compliance OneDrive' :
                            selectedType === 'sap' ? 'e.g., SAP Production System' :
                            selectedType === 'jira' ? 'e.g., Compliance Jira Project' :
                            selectedType === 'slack' ? 'e.g., Legal Slack Channel' :
                            selectedType === 'teams' ? 'e.g., Compliance Teams Channel' :
                            selectedType === 'rss_feed' ? 'e.g., Regulatory News Feed' :
                            'e.g., My Connector'
                          }
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          maxLength={100}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.name.length}/100 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="connector-desc">Description</Label>
                          <InfoModal 
                            title="Description"
                            description="Optional: Add details about what data this connector accesses and its compliance purpose."
                            example="Examples:\n• 'GDPR compliance documents from production environment'\n• 'Employee personal data for DSAR processing'\n• 'Financial audit trail from SAP'"
                          />
                        </div>
                        <Textarea
                          id="connector-desc"
                          placeholder="e.g., Compliance documents from production environment"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/500 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="sync-freq">Sync Frequency</Label>
                          <InfoModal 
                            title="Sync Frequency"
                            description="How often should this connector automatically sync data? Choose based on your compliance monitoring needs and data volume."
                            example="• Hourly: Real-time compliance monitoring\n• Daily: Standard compliance checks\n• Weekly: Periodic reviews\n• Manual Only: On-demand syncing"
                          />
                        </div>
                        <Select 
                          value={formData.sync_frequency} 
                          onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                        >
                          <SelectTrigger id="sync-freq">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly - Real-time monitoring</SelectItem>
                            <SelectItem value="daily">Daily - Standard compliance</SelectItem>
                            <SelectItem value="weekly">Weekly - Periodic reviews</SelectItem>
                            <SelectItem value="manual">Manual Only - On-demand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {renderConfigFields()}

                      <div className="flex gap-2">
                        <Button 
                          onClick={validateConnector} 
                          variant="outline" 
                          disabled={validating || !selectedType || Object.keys(formData.config).length === 0}
                          className="flex-1"
                        >
                          {validating ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={createConnector} 
                          disabled={!validationResult?.valid || !formData.name}
                          className="flex-1"
                        >
                          Create Connector
                        </Button>
                      </div>

                      {validationResult && (
                        <div className={`p-3 rounded-md text-sm ${
                          validationResult.valid 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex items-start gap-2">
                            {validationResult.valid ? (
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            )}
                            <span>{validationResult.message}</span>
                          </div>
                        </div>
                      )}
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