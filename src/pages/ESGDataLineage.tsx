import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { GitBranch, Activity, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { LineageGraph } from "@/components/LineageGraph";

interface LocalLineageNode {
  id: string;
  type: 'source' | 'process' | 'storage' | 'transfer';
  name: string;
  timestamp: string;
  jurisdiction?: string;
  metadata?: any;
}

interface LocalLineageEdge {
  from: string;
  to: string;
  transformation?: string;
}

export default function ESGDataLineage() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineageData, setLineageData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [lineageNodes, setLineageNodes] = useState<LocalLineageNode[]>([]);
  const [lineageEdges, setLineageEdges] = useState<LocalLineageEdge[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        
        if (data?.organization_id) {
          setOrganizationId(data.organization_id);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      loadLineageData();
      loadKPIs();
      calculateDataQuality();
    }
  }, [organizationId]);

  const loadLineageData = async () => {
    try {
      const { data, error } = await supabase
        .from('esg_data_lineage')
        .select(`
          *,
          esg_data_lake(*),
          esg_connectors(*)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLineageData(data || []);
      buildLineageGraph(data || []);
    } catch (error: any) {
      console.error('Error loading lineage:', error);
      toast.error('Failed to load data lineage');
    }
  };

  const buildLineageGraph = (lineage: any[]) => {
    const nodes: LocalLineageNode[] = [];
    const edges: LocalLineageEdge[] = [];
    const nodeMap = new Map();

    lineage.forEach(record => {
      // Source node
      if (record.connector_id && !nodeMap.has(record.connector_id)) {
        nodes.push({
          id: record.connector_id,
          type: 'source',
          name: record.esg_connectors?.connector_name || 'Unknown Source',
          timestamp: record.created_at,
          metadata: record.esg_connectors
        });
        nodeMap.set(record.connector_id, true);
      }

      // Transformation node
      const transformId = `transform_${record.id}`;
      if (!nodeMap.has(transformId)) {
        nodes.push({
          id: transformId,
          type: 'process',
          name: record.transformation_type,
          timestamp: record.created_at,
          metadata: {
            quality_score: record.quality_score,
            created_at: record.created_at
          }
        });
        nodeMap.set(transformId, true);
      }

      // Edges
      if (record.connector_id) {
        edges.push({
          from: record.connector_id,
          to: transformId,
          transformation: record.transformation_type
        });
      }
    });

    setLineageNodes(nodes);
    setLineageEdges(edges);
  };

  const loadKPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('esg_kpis')
        .select('*')
        .eq('organization_id', organizationId)
        .order('extracted_at', { ascending: false });

      if (error) throw error;
      setKpis(data || []);
    } catch (error: any) {
      console.error('Error loading KPIs:', error);
      toast.error('Failed to load KPIs');
    }
  };

  const calculateDataQuality = async () => {
    try {
      const { data: dataLake } = await supabase
        .from('esg_data_lake')
        .select('quality_score, processed_at')
        .eq('organization_id', organizationId)
        .not('quality_score', 'is', null);

      if (dataLake && dataLake.length > 0) {
        const avgQuality = dataLake.reduce((sum, d) => sum + (d.quality_score || 0), 0) / dataLake.length;
        const processedCount = dataLake.filter(d => d.processed_at).length;
        
        setDataQuality({
          averageScore: avgQuality.toFixed(1),
          processedSources: processedCount,
          totalSources: dataLake.length,
          completeness: ((processedCount / dataLake.length) * 100).toFixed(0)
        });
      }
    } catch (error: any) {
      console.error('Error calculating data quality:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractKPIs = async () => {
    try {
      setLoading(true);
      toast.info('Extracting KPIs from data sources...');

      const { data, error } = await supabase.functions.invoke('extract-esg-kpis', {
        body: {
          organization_id: organizationId,
          fiscal_year: new Date().getFullYear()
        }
      });

      if (error) throw error;

      toast.success(`Extracted ${data.kpis_extracted} KPIs successfully`);
      loadKPIs();
      loadLineageData();
    } catch (error: any) {
      console.error('Error extracting KPIs:', error);
      toast.error('Failed to extract KPIs');
    } finally {
      setLoading(false);
    }
  };

  const getESRSBadgeColor = (module: string) => {
    if (module.startsWith('E')) return 'bg-green-500';
    if (module.startsWith('S')) return 'bg-blue-500';
    if (module.startsWith('G')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ESG Data Lineage & KPIs</h1>
          <p className="text-muted-foreground">
            Track data flows, transformations, and extracted KPIs
          </p>
        </div>
        <Button onClick={extractKPIs} disabled={loading}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Extract KPIs
        </Button>
      </div>

      {/* Data Quality Overview */}
      {dataQuality && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataQuality.averageScore}/100</div>
              <p className="text-xs text-muted-foreground">Data quality rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Processed Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dataQuality.processedSources}/{dataQuality.totalSources}
              </div>
              <p className="text-xs text-muted-foreground">{dataQuality.completeness}% complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">KPIs Extracted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.length}</div>
              <p className="text-xs text-muted-foreground">Across all ESRS modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Lineage Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lineageData.length}</div>
              <p className="text-xs text-muted-foreground">Transformation steps</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="lineage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lineage">
            <GitBranch className="w-4 h-4 mr-2" />
            Data Lineage
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <TrendingUp className="w-4 h-4 mr-2" />
            Extracted KPIs
          </TabsTrigger>
          <TabsTrigger value="transformations">
            <Activity className="w-4 h-4 mr-2" />
            Transformations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Visualization</CardTitle>
              <CardDescription>
                Visual representation of data sources, transformations, and KPI extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lineageNodes.length > 0 ? (
                <div className="h-[600px] border rounded-lg">
                  <LineageGraph 
                    nodes={lineageNodes} 
                    edges={lineageEdges}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No lineage data available yet. Start by syncing data sources.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted KPIs by ESRS Module</CardTitle>
              <CardDescription>
                Key Performance Indicators automatically extracted from your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No KPIs extracted yet. Click "Extract KPIs" to analyze your data.
                  </div>
                ) : (
                  kpis.map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getESRSBadgeColor(kpi.esrs_module)}>
                          {kpi.esrs_module}
                        </Badge>
                        <div>
                          <p className="font-medium">{kpi.kpi_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {kpi.kpi_value} {kpi.kpi_unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {kpi.confidence_score}% confidence
                        </Badge>
                        {kpi.validated ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transformations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Transformation Log</CardTitle>
              <CardDescription>
                History of all data cleaning and transformation operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lineageData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transformations recorded yet.
                  </div>
                ) : (
                  lineageData.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{record.transformation_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.esg_connectors?.connector_name || 'Unknown source'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {record.quality_score && (
                          <Badge variant="outline">
                            Quality: {record.quality_score.toFixed(0)}/100
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
