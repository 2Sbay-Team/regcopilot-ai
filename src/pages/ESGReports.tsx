import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Database, 
  FileCheck, 
  TrendingUp, 
  FileText, 
  Loader2,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";

export default function ESGReports() {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("connectors");
  
  // Progress tracking
  const [progress, setProgress] = useState({
    connectors: 0,
    dataQuality: 0,
    kpis: 0,
    report: 0
  });

  // Data states
  const [connectors, setConnectors] = useState<any[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

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
      loadProgress();
    }
  }, [organizationId]);

  const loadProgress = async () => {
    try {
      // Check connectors
      const { data: connectorData } = await supabase
        .from('esg_connectors')
        .select('*')
        .eq('organization_id', organizationId);
      
      setConnectors(connectorData || []);
      setProgress(prev => ({ ...prev, connectors: connectorData?.length || 0 }));

      // Check data quality
      const { data: dataLakeData } = await supabase
        .from('esg_data_lake')
        .select('quality_score, processed_at')
        .eq('organization_id', organizationId);
      
      if (dataLakeData && dataLakeData.length > 0) {
        const avgQuality = dataLakeData.reduce((sum, d) => sum + (d.quality_score || 0), 0) / dataLakeData.length;
        const processedCount = dataLakeData.filter(d => d.processed_at).length;
        setDataQuality({
          avgScore: avgQuality.toFixed(0),
          processed: processedCount,
          total: dataLakeData.length
        });
        setProgress(prev => ({ ...prev, dataQuality: processedCount }));
      }

      // Check KPIs
      const { data: kpiData } = await supabase
        .from('esg_kpis')
        .select('*')
        .eq('organization_id', organizationId);
      
      setKpis(kpiData || []);
      setProgress(prev => ({ ...prev, kpis: kpiData?.length || 0 }));

      // Check reports
      const { data: reportData } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (reportData && reportData.length > 0) {
        setReport(reportData[0]);
        setProgress(prev => ({ ...prev, report: 1 }));
      }
    } catch (error: any) {
      console.error('Error loading progress:', error);
    }
  };

  const syncConnector = async (connectorId: string) => {
    try {
      setLoading(true);
      toast.info('Syncing data source...');

      const { data, error } = await supabase.functions.invoke('sync-esg-connector', {
        body: { connector_id: connectorId }
      });

      if (error) throw error;

      toast.success(`Synced ${data.records_processed} records successfully`);
      loadProgress();
    } catch (error: any) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync connector');
    } finally {
      setLoading(false);
    }
  };

  const cleanData = async () => {
    try {
      setLoading(true);
      toast.info('Cleaning and validating data...');

      // Get all unprocessed data
      const { data: rawData } = await supabase
        .from('esg_data_lake')
        .select('id')
        .eq('organization_id', organizationId)
        .is('processed_at', null);

      if (!rawData || rawData.length === 0) {
        toast.info('No new data to clean');
        setLoading(false);
        return;
      }

      // Clean each data source
      for (const item of rawData) {
        const { error } = await supabase.functions.invoke('clean-esg-data', {
          body: { data_lake_id: item.id }
        });
        if (error) console.error('Cleaning error:', error);
      }

      toast.success(`Cleaned ${rawData.length} data sources`);
      loadProgress();
    } catch (error: any) {
      console.error('Error cleaning data:', error);
      toast.error('Failed to clean data');
    } finally {
      setLoading(false);
    }
  };

  const extractKPIs = async () => {
    try {
      setLoading(true);
      toast.info('Extracting KPIs from data...');

      const { data, error } = await supabase.functions.invoke('extract-esg-kpis', {
        body: {
          organization_id: organizationId,
          fiscal_year: new Date().getFullYear()
        }
      });

      if (error) throw error;

      toast.success(`Extracted ${data.kpis_extracted} KPIs`);
      loadProgress();
      setActiveTab("report");
    } catch (error: any) {
      console.error('Error extracting KPIs:', error);
      toast.error('Failed to extract KPIs');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      toast.info('Generating ESG report...');

      const { data, error } = await supabase.functions.invoke('esg-reporter', {
        body: {
          org_id: organizationId,
          data: {
            period: `${new Date().getFullYear()}-FY`,
            co2_scope1: 0,
            co2_scope2: 0,
            co2_scope3: 0,
            energy_mwh: 0
          }
        }
      });

      if (error) throw error;

      toast.success('ESG report generated successfully');
      loadProgress();
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: keyof typeof progress) => {
    const value = progress[step];
    if (value === 0) return { icon: AlertCircle, color: "text-gray-400", text: "Not started" };
    if (step === "report" && value > 0) return { icon: CheckCircle, color: "text-green-500", text: "Complete" };
    return { icon: CheckCircle, color: "text-blue-500", text: `${value} items` };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ESG Reports Module</h1>
        <p className="text-muted-foreground">
          Complete workflow: Connect Data → Clean → Extract KPIs → Generate Report
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { key: "connectors", label: "Data Sources", icon: Database },
          { key: "dataQuality", label: "Data Quality", icon: FileCheck },
          { key: "kpis", label: "KPIs Extracted", icon: TrendingUp },
          { key: "report", label: "Report", icon: FileText }
        ].map(({ key, label, icon: Icon }) => {
          const status = getStepStatus(key as keyof typeof progress);
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <status.icon className={`w-5 h-5 ${status.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{status.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connectors">
            <Database className="w-4 h-4 mr-2" />
            1. Data Sources
          </TabsTrigger>
          <TabsTrigger value="quality">
            <FileCheck className="w-4 h-4 mr-2" />
            2. Data Quality
          </TabsTrigger>
          <TabsTrigger value="kpis">
            <TrendingUp className="w-4 h-4 mr-2" />
            3. Extract KPIs
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileText className="w-4 h-4 mr-2" />
            4. Generate Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Data Sources</CardTitle>
              <CardDescription>
                Configure connectors to SAP, Databricks, S3, Excel, Jira, HR systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectors.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No data sources connected yet</p>
                  <Button onClick={() => window.location.href = '/esg-data-sources'}>
                    Configure Data Sources
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <div key={connector.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{connector.connector_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {connector.connector_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={connector.status === 'active' ? 'default' : 'secondary'}>
                          {connector.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => syncConnector(connector.id)}
                          disabled={loading}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/esg-data-sources'}
                  >
                    Add More Data Sources
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality & Cleaning</CardTitle>
              <CardDescription>
                Validate, clean, and normalize ESG data using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataQuality ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{dataQuality.avgScore}/100</p>
                      <p className="text-sm text-muted-foreground">Avg Quality Score</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{dataQuality.processed}/{dataQuality.total}</p>
                      <p className="text-sm text-muted-foreground">Data Sources Processed</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">
                        {((dataQuality.processed / dataQuality.total) * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Completeness</p>
                    </div>
                  </div>
                  <Button onClick={cleanData} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cleaning Data...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 mr-2" />
                        Clean & Validate Data
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No data available. Please sync data sources first.
                  </p>
                  <Button onClick={() => setActiveTab("connectors")}>
                    Go to Data Sources
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KPI Extraction</CardTitle>
              <CardDescription>
                Automatically extract ESRS-compliant KPIs from your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpis.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-3xl font-bold">{kpis.length}</p>
                    <p className="text-sm text-muted-foreground">KPIs Extracted</p>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {kpis.slice(0, 10).map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{kpi.kpi_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {kpi.kpi_value} {kpi.kpi_unit}
                          </p>
                        </div>
                        <Badge>{kpi.esrs_module}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button onClick={extractKPIs} disabled={loading} variant="outline" className="w-full">
                    Re-extract KPIs
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No KPIs extracted yet. Clean your data first.
                  </p>
                  <Button onClick={extractKPIs} disabled={loading || !dataQuality}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Extract KPIs
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate ESG Report</CardTitle>
              <CardDescription>
                Create CSRD/ESRS-compliant sustainability report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {report ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">Latest Report</p>
                    <p className="text-sm text-muted-foreground">
                      Generated: {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completeness: {report.completeness}%
                    </p>
                  </div>
                  <Button onClick={generateReport} disabled={loading} variant="outline" className="w-full">
                    Generate New Report
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Ready to generate your ESG report
                  </p>
                  <Button onClick={generateReport} disabled={loading || kpis.length === 0}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
