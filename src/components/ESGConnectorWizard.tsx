import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ESGConnectorWizardProps {
  open: boolean;
  onClose: () => void;
  connectorType: string;
}

const WIZARD_STEPS = {
  sap: ['Basic Info', 'SAP Connection', 'Field Mapping', 'Test & Save'],
  databricks: ['Basic Info', 'Databricks Config', 'Query Setup', 'Test & Save'],
  s3: ['Basic Info', 'S3 Credentials', 'Bucket Config', 'Test & Save'],
  database: ['Basic Info', 'Database Connection', 'Table Mapping', 'Test & Save'],
  excel: ['Basic Info', 'Upload Config', 'Column Mapping', 'Schedule'],
  jira: ['Basic Info', 'Jira Connection', 'Project Mapping', 'Test & Save'],
  pdf: ['Basic Info', 'Upload Config', 'Extraction Rules', 'Schedule'],
  hr_system: ['Basic Info', 'HR System Config', 'Metric Mapping', 'Test & Save'],
};

export function ESGConnectorWizard({ open, onClose, connectorType }: ESGConnectorWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const [formData, setFormData] = useState({
    connector_name: '',
    
    // SAP
    sap_host: '',
    sap_client: '',
    sap_username: '',
    sap_password: '',
    sap_system_number: '',
    
    // Databricks
    databricks_host: '',
    databricks_token: '',
    databricks_warehouse_id: '',
    databricks_catalog: '',
    
    // S3
    s3_bucket: '',
    s3_region: '',
    s3_access_key: '',
    s3_secret_key: '',
    s3_prefix: '',
    
    // Database
    db_host: '',
    db_port: '',
    db_name: '',
    db_username: '',
    db_password: '',
    db_type: 'postgresql',
    
    // Jira
    jira_url: '',
    jira_email: '',
    jira_api_token: '',
    jira_project_key: '',
    
    // HR System
    hr_system_type: '',
    hr_api_url: '',
    hr_api_key: '',
    
    // Common
    sync_schedule: 'daily',
    description: '',
  });

  const steps = WIZARD_STEPS[connectorType as keyof typeof WIZARD_STEPS] || ['Basic Info', 'Configuration', 'Test & Save'];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-esg-connector', {
        body: {
          connector_type: connectorType,
          config: formData
        }
      });

      if (error) throw error;

      if (data.success) {
        setTestSuccess(true);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the data source",
        });
      } else {
        throw new Error(data.error || 'Connection test failed');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
      setTestSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id)
        .single();

      const connectionConfig: any = {};
      
      // Build connection config based on connector type
      switch (connectorType) {
        case 'sap':
          connectionConfig.host = formData.sap_host;
          connectionConfig.client = formData.sap_client;
          connectionConfig.username = formData.sap_username;
          connectionConfig.password = formData.sap_password;
          connectionConfig.system_number = formData.sap_system_number;
          break;
        case 'databricks':
          connectionConfig.host = formData.databricks_host;
          connectionConfig.token = formData.databricks_token;
          connectionConfig.warehouse_id = formData.databricks_warehouse_id;
          connectionConfig.catalog = formData.databricks_catalog;
          break;
        case 's3':
          connectionConfig.bucket = formData.s3_bucket;
          connectionConfig.region = formData.s3_region;
          connectionConfig.access_key = formData.s3_access_key;
          connectionConfig.secret_key = formData.s3_secret_key;
          connectionConfig.prefix = formData.s3_prefix;
          break;
        case 'database':
          connectionConfig.host = formData.db_host;
          connectionConfig.port = formData.db_port;
          connectionConfig.database = formData.db_name;
          connectionConfig.username = formData.db_username;
          connectionConfig.password = formData.db_password;
          connectionConfig.type = formData.db_type;
          break;
        case 'jira':
          connectionConfig.url = formData.jira_url;
          connectionConfig.email = formData.jira_email;
          connectionConfig.api_token = formData.jira_api_token;
          connectionConfig.project_key = formData.jira_project_key;
          break;
        case 'hr_system':
          connectionConfig.system_type = formData.hr_system_type;
          connectionConfig.api_url = formData.hr_api_url;
          connectionConfig.api_key = formData.hr_api_key;
          break;
      }

      const { error } = await supabase.from('esg_connectors').insert({
        organization_id: profile?.organization_id,
        connector_name: formData.connector_name,
        connector_type: connectorType,
        connection_config: connectionConfig,
        sync_schedule: formData.sync_schedule,
        status: 'configured',
        created_by: user?.id
      });

      if (error) throw error;

      toast({
        title: "Connector Created",
        description: `Successfully configured ${formData.connector_name}`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const stepName = steps[currentStep];

    if (stepName === 'Basic Info') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="connector_name">Connection Name *</Label>
            <Input
              id="connector_name"
              value={formData.connector_name}
              onChange={(e) => updateField('connector_name', e.target.value)}
              placeholder="e.g., SAP Production Environment"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of this data source"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="sync_schedule">Sync Schedule</Label>
            <Select value={formData.sync_schedule} onValueChange={(val) => updateField('sync_schedule', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    // SAP Configuration
    if (connectorType === 'sap' && stepName === 'SAP Connection') {
      return (
        <div className="space-y-4">
          <div>
            <Label>SAP Host *</Label>
            <Input value={formData.sap_host} onChange={(e) => updateField('sap_host', e.target.value)} placeholder="sap.company.com" />
          </div>
          <div>
            <Label>Client Number *</Label>
            <Input value={formData.sap_client} onChange={(e) => updateField('sap_client', e.target.value)} placeholder="100" />
          </div>
          <div>
            <Label>System Number *</Label>
            <Input value={formData.sap_system_number} onChange={(e) => updateField('sap_system_number', e.target.value)} placeholder="00" />
          </div>
          <div>
            <Label>Username *</Label>
            <Input value={formData.sap_username} onChange={(e) => updateField('sap_username', e.target.value)} />
          </div>
          <div>
            <Label>Password *</Label>
            <Input type="password" value={formData.sap_password} onChange={(e) => updateField('sap_password', e.target.value)} />
          </div>
        </div>
      );
    }

    // Databricks Configuration
    if (connectorType === 'databricks' && stepName === 'Databricks Config') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Databricks Host *</Label>
            <Input value={formData.databricks_host} onChange={(e) => updateField('databricks_host', e.target.value)} placeholder="company.cloud.databricks.com" />
          </div>
          <div>
            <Label>Access Token *</Label>
            <Input type="password" value={formData.databricks_token} onChange={(e) => updateField('databricks_token', e.target.value)} />
          </div>
          <div>
            <Label>Warehouse ID *</Label>
            <Input value={formData.databricks_warehouse_id} onChange={(e) => updateField('databricks_warehouse_id', e.target.value)} />
          </div>
          <div>
            <Label>Catalog</Label>
            <Input value={formData.databricks_catalog} onChange={(e) => updateField('databricks_catalog', e.target.value)} placeholder="main" />
          </div>
        </div>
      );
    }

    // S3 Configuration
    if (connectorType === 's3' && stepName === 'S3 Credentials') {
      return (
        <div className="space-y-4">
          <div>
            <Label>S3 Bucket Name *</Label>
            <Input value={formData.s3_bucket} onChange={(e) => updateField('s3_bucket', e.target.value)} placeholder="my-esg-data" />
          </div>
          <div>
            <Label>AWS Region *</Label>
            <Input value={formData.s3_region} onChange={(e) => updateField('s3_region', e.target.value)} placeholder="us-east-1" />
          </div>
          <div>
            <Label>Access Key ID *</Label>
            <Input value={formData.s3_access_key} onChange={(e) => updateField('s3_access_key', e.target.value)} />
          </div>
          <div>
            <Label>Secret Access Key *</Label>
            <Input type="password" value={formData.s3_secret_key} onChange={(e) => updateField('s3_secret_key', e.target.value)} />
          </div>
          <div>
            <Label>Prefix (optional)</Label>
            <Input value={formData.s3_prefix} onChange={(e) => updateField('s3_prefix', e.target.value)} placeholder="esg-data/" />
          </div>
        </div>
      );
    }

    // Database Configuration
    if (connectorType === 'database' && stepName === 'Database Connection') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Database Type *</Label>
            <Select value={formData.db_type} onValueChange={(val) => updateField('db_type', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
                <SelectItem value="mongodb">MongoDB</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Host *</Label>
            <Input value={formData.db_host} onChange={(e) => updateField('db_host', e.target.value)} placeholder="db.company.com" />
          </div>
          <div>
            <Label>Port *</Label>
            <Input value={formData.db_port} onChange={(e) => updateField('db_port', e.target.value)} placeholder="5432" />
          </div>
          <div>
            <Label>Database Name *</Label>
            <Input value={formData.db_name} onChange={(e) => updateField('db_name', e.target.value)} />
          </div>
          <div>
            <Label>Username *</Label>
            <Input value={formData.db_username} onChange={(e) => updateField('db_username', e.target.value)} />
          </div>
          <div>
            <Label>Password *</Label>
            <Input type="password" value={formData.db_password} onChange={(e) => updateField('db_password', e.target.value)} />
          </div>
        </div>
      );
    }

    // Jira Configuration
    if (connectorType === 'jira' && stepName === 'Jira Connection') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Jira URL *</Label>
            <Input value={formData.jira_url} onChange={(e) => updateField('jira_url', e.target.value)} placeholder="https://company.atlassian.net" />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={formData.jira_email} onChange={(e) => updateField('jira_email', e.target.value)} />
          </div>
          <div>
            <Label>API Token *</Label>
            <Input type="password" value={formData.jira_api_token} onChange={(e) => updateField('jira_api_token', e.target.value)} />
          </div>
          <div>
            <Label>Project Key</Label>
            <Input value={formData.jira_project_key} onChange={(e) => updateField('jira_project_key', e.target.value)} placeholder="ESG" />
          </div>
        </div>
      );
    }

    // HR System Configuration
    if (connectorType === 'hr_system' && stepName === 'HR System Config') {
      return (
        <div className="space-y-4">
          <div>
            <Label>HR System Type *</Label>
            <Select value={formData.hr_system_type} onValueChange={(val) => updateField('hr_system_type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select HR system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workday">Workday</SelectItem>
                <SelectItem value="successfactors">SAP SuccessFactors</SelectItem>
                <SelectItem value="bamboohr">BambooHR</SelectItem>
                <SelectItem value="adp">ADP</SelectItem>
                <SelectItem value="custom">Custom API</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>API URL *</Label>
            <Input value={formData.hr_api_url} onChange={(e) => updateField('hr_api_url', e.target.value)} placeholder="https://api.hrsystem.com" />
          </div>
          <div>
            <Label>API Key *</Label>
            <Input type="password" value={formData.hr_api_key} onChange={(e) => updateField('hr_api_key', e.target.value)} />
          </div>
        </div>
      );
    }

    // Test & Save (final step for all connectors)
    if (stepName === 'Test & Save') {
      return (
        <div className="space-y-4">
          <div className="text-center py-6">
            {testSuccess ? (
              <div className="space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">Connection Successful!</h3>
                <p className="text-muted-foreground">Your data source is ready to sync ESG metrics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Test the connection before saving</p>
                <Button onClick={testConnection} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Test Connection
                </Button>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-foreground">Summary</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Connection Name:</dt>
                <dd className="font-medium text-foreground">{formData.connector_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type:</dt>
                <dd className="font-medium text-foreground">{connectorType.toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sync Schedule:</dt>
                <dd className="font-medium text-foreground">{formData.sync_schedule}</dd>
              </div>
            </dl>
          </div>
        </div>
      );
    }

    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Field mapping and configuration will be available after connection setup</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {connectorType.toUpperCase()} Connector</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`h-2 flex-1 rounded-full ${index <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
              {index < steps.length - 1 && <div className="w-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSave} disabled={loading || !testSuccess}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Connector
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}