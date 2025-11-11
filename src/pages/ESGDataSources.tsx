import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Database, Workflow, FileSpreadsheet, FileText, Users, Cloud, Grid } from "lucide-react";
import { ESGConnectorWizard } from "@/components/ESGConnectorWizard";

const CONNECTOR_TYPES = [
  { 
    type: 'sap', 
    name: 'SAP', 
    icon: Grid, 
    description: 'Connect to SAP ERP for financial and operational data',
    color: 'bg-blue-500'
  },
  { 
    type: 'databricks', 
    name: 'Databricks', 
    icon: Workflow, 
    description: 'Connect to Databricks for analytics and data warehousing',
    color: 'bg-orange-500'
  },
  { 
    type: 's3', 
    name: 'S3 Storage', 
    icon: Cloud, 
    description: 'Connect to AWS S3 for blob storage and file repositories',
    color: 'bg-yellow-500'
  },
  { 
    type: 'database', 
    name: 'Database', 
    icon: Database, 
    description: 'Connect to SQL/NoSQL databases (PostgreSQL, MySQL, MongoDB)',
    color: 'bg-purple-500'
  },
  { 
    type: 'excel', 
    name: 'Excel Files', 
    icon: FileSpreadsheet, 
    description: 'Import ESG data from Excel spreadsheets',
    color: 'bg-green-500'
  },
  { 
    type: 'jira', 
    name: 'Jira', 
    icon: Grid, 
    description: 'Connect to Jira for sustainability project tracking',
    color: 'bg-blue-600'
  },
  { 
    type: 'pdf', 
    name: 'PDF Documents', 
    icon: FileText, 
    description: 'Extract ESG data from PDF reports and documents',
    color: 'bg-red-500'
  },
  { 
    type: 'hr_system', 
    name: 'HR System', 
    icon: Users, 
    description: 'Connect to HR systems for workforce and diversity metrics',
    color: 'bg-indigo-500'
  },
];

export default function ESGDataSources() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: connectors, isLoading, refetch } = useQuery({
    queryKey: ['esg-connectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_connectors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const openWizard = (type: string) => {
    setSelectedType(type);
    setWizardOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'configured': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ESG Data Sources</h1>
          <p className="text-muted-foreground mt-2">
            Connect external systems to automatically ingest ESG data into your centralized data lake
          </p>
        </div>
      </div>

      {/* Available Connectors */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Available Connectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONNECTOR_TYPES.map((connector) => {
            const Icon = connector.icon;
            const isConnected = connectors?.some(c => c.connector_type === connector.type);
            
            return (
              <Card
                key={connector.type}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-border"
                onClick={() => openWizard(connector.type)}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`${connector.color} p-2 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {isConnected && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{connector.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{connector.description}</p>
                  </div>
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {isConnected ? 'Manage' : 'Connect'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Connections */}
      {connectors && connectors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Active Connections</h2>
          <div className="space-y-3">
            {connectors.map((connector) => {
              const connectorType = CONNECTOR_TYPES.find(t => t.type === connector.connector_type);
              const Icon = connectorType?.icon || Database;
              
              return (
                <Card key={connector.id} className="p-4 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${connectorType?.color || 'bg-gray-500'} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{connector.connector_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connectorType?.name} • Last sync: {connector.last_sync_at ? new Date(connector.last_sync_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(connector.status)}>
                        {connector.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedType(connector.connector_type);
                          setWizardOpen(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Wizard Dialog */}
      {selectedType && (
        <ESGConnectorWizard
          open={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedType(null);
            refetch();
          }}
          connectorType={selectedType}
        />
      )}
    </div>
  );
}