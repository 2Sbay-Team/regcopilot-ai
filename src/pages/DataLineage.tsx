import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Database, GitBranch, AlertTriangle, CheckCircle, RefreshCw, X, Clock, MapPin, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineageGraph } from "@/components/LineageGraph"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LineageNode {
  id: string
  type: 'source' | 'process' | 'storage' | 'transfer'
  name: string
  jurisdiction?: string
  timestamp: string
}

interface LineageEdge {
  from: string
  to: string
  transformation?: string
}

const DataLineage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [graph, setGraph] = useState<{ nodes: LineageNode[]; edges: LineageEdge[] } | null>(null)
  const [insights, setInsights] = useState<string>('')
  const [stats, setStats] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null)
  const [nodeAuditLogs, setNodeAuditLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const { toast } = useToast()

  // Form state for tracking new data flow
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [transformation, setTransformation] = useState('')
  const [jurisdiction, setJurisdiction] = useState('EU')

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  const trackDataFlow = async () => {
    if (!profile?.organization_id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('data-lineage', {
        body: {
          org_id: profile.organization_id,
          action: 'track',
          data: {
            source,
            destination,
            transformation,
            jurisdiction
          }
        }
      })

      if (error) throw error

      toast({
        title: "Data Flow Tracked",
        description: data.cross_border_transfer 
          ? "⚠️ Cross-border transfer detected - high risk"
          : "✓ Data flow recorded successfully"
      })

      setSource('')
      setDestination('')
      setTransformation('')
      loadLineageGraph()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLineageGraph = async () => {
    if (!profile?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('data-lineage', {
        body: {
          org_id: profile.organization_id,
          action: 'query'
        }
      })

      if (error) throw error

      setGraph(data.graph)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading lineage",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    if (!profile?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('data-lineage', {
        body: {
          org_id: profile.organization_id,
          action: 'visualize'
        }
      })

      if (error) throw error

      setInsights(data.insights)
      setStats(data.stats)

      toast({
        title: "Insights Generated",
        description: "AI analysis complete"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.organization_id) {
      loadLineageGraph()
    }
  }, [profile])

  const handleNodeClick = async (node: LineageNode) => {
    setSelectedNode(node)
    setLoadingLogs(true)
    
    try {
      // Fetch audit logs related to this node
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .eq('agent', 'data_lineage')
        .or(`request_payload->>source_system.eq.${node.name},request_payload->>destination_system.eq.${node.name}`)
        .order('timestamp', { ascending: false })
        .limit(20)

      if (error) throw error
      
      setNodeAuditLogs(data || [])
    } catch (error: any) {
      console.error('Error loading node logs:', error)
      toast({
        variant: "destructive",
        title: "Error loading logs",
        description: error.message
      })
    } finally {
      setLoadingLogs(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DataSage Governance
          </h1>
          <p className="text-muted-foreground font-medium">Track data lineage and sovereignty for GDPR compliance</p>
        </div>
        <Button onClick={generateInsights} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Generate Insights
        </Button>
      </div>

      {/* Track New Data Flow */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Track New Data Flow
          </CardTitle>
          <CardDescription>Record data movement between systems for lineage tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">Source System</Label>
              <Input
                id="source"
                placeholder="e.g., CRM, Analytics DB"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination System</Label>
              <Input
                id="destination"
                placeholder="e.g., Data Warehouse, Cloud Storage"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transformation">Transformation Applied</Label>
            <Input
              id="transformation"
              placeholder="e.g., Anonymization, Aggregation"
              value={transformation}
              onChange={(e) => setTransformation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <select
              id="jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="EU">European Union</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Button onClick={trackDataFlow} disabled={loading || !source || !destination} className="w-full">
            Track Data Flow
          </Button>
        </CardContent>
      </Card>

      {/* Interactive Lineage Graph */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Interactive Data Flow Graph
          </CardTitle>
          <CardDescription>
            Drag nodes to rearrange • Zoom and pan to explore
            {graph && graph.nodes.length > 0 && (
              <span className="ml-2 font-medium text-foreground">
                • {graph.nodes.length} systems • {graph.edges.length} flows
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LineageGraph 
            nodes={graph?.nodes || []} 
            edges={graph?.edges || []}
            onNodeClick={handleNodeClick}
          />
        </CardContent>
      </Card>

      {/* Node Details Panel */}
      {selectedNode && (
        <Card className="cockpit-panel border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Node Details: {selectedNode.name}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedNode(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Full metadata and related audit logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Node Metadata */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Node Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {selectedNode.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Jurisdiction
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {selectedNode.jurisdiction || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Timestamp
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(selectedNode.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Node ID</Label>
                    <p className="text-xs font-mono mt-1 text-muted-foreground break-all">
                      {selectedNode.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Audit Logs */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Related Audit Logs</Label>
                  <Badge variant="secondary">{nodeAuditLogs.length} entries</Badge>
                </div>

                {loadingLogs ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading audit logs...</p>
                  </div>
                ) : nodeAuditLogs.length > 0 ? (
                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-4 space-y-3">
                      {nodeAuditLogs.map((log) => {
                        const payload = log.request_payload as any
                        const isCrossBorder = payload?.is_cross_border
                        
                        return (
                          <div 
                            key={log.id} 
                            className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {payload?.source_system || 'Unknown'} → {payload?.destination_system || 'Unknown'}
                                  </span>
                                  {isCrossBorder && (
                                    <Badge variant="destructive" className="text-xs">
                                      Cross-Border
                                    </Badge>
                                  )}
                                </div>
                                
                                {payload?.transformation_applied && payload.transformation_applied !== 'none' && (
                                  <div className="text-xs text-muted-foreground">
                                    Transformation: {payload.transformation_applied}
                                  </div>
                                )}
                              </div>
                              
                              <Badge 
                                variant={log.status === 'success' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {log.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              {payload?.source_jurisdiction && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {payload.source_jurisdiction}
                                </span>
                              )}
                            </div>

                            {log.reasoning_chain && (
                              <div className="text-xs bg-background/50 rounded p-2 mt-2">
                                <span className="font-medium">Risk: </span>
                                <span className={
                                  (log.reasoning_chain as any)?.risk_flag === 'high' 
                                    ? 'text-destructive font-medium' 
                                    : 'text-accent'
                                }>
                                  {(log.reasoning_chain as any)?.risk_flag || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No audit logs found for this node</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="cockpit-panel">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats?.compliance_risk === 'high' ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-accent" />
              )}
              Governance Insights
            </CardTitle>
            <CardDescription>AI-powered compliance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {insights ? (
              <div className="space-y-4">
                {stats && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-4 rounded-lg bg-primary/10">
                      <div className="text-3xl font-bold text-foreground">{stats.total_flows}</div>
                      <div className="text-xs text-muted-foreground font-medium">Total Flows</div>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10">
                      <div className="text-3xl font-bold text-foreground">{stats.cross_border_transfers}</div>
                      <div className="text-xs text-muted-foreground font-medium">Cross-Border</div>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10">
                      <div className="text-3xl font-bold text-foreground capitalize">{stats.compliance_risk}</div>
                      <div className="text-xs text-muted-foreground font-medium">Risk Level</div>
                    </div>
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{insights}</div>
                </div>

                {stats?.compliance_risk === 'high' && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-destructive mb-1">High Compliance Risk Detected</p>
                        <p className="text-muted-foreground">Multiple cross-border transfers detected. Review GDPR Chapter V safeguards and ensure adequate transfer mechanisms are in place.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No insights generated yet</p>
                <p className="text-sm">Click "Generate Insights" above to analyze your data flows with AI</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DataLineage
