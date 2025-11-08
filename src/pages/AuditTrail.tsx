import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Shield, Search, CheckCircle, XCircle, Loader2 } from "lucide-react"

const AuditTrail = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verifying, setVerifying] = useState(false)
  const [hashIntegrity, setHashIntegrity] = useState<{ valid: boolean; checked: number } | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, searchQuery, moduleFilter, statusFilter])

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500)

      if (error) throw error
      setLogs(data || [])
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load logs", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.agent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.event_type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (moduleFilter !== "all") {
      filtered = filtered.filter(log => log.agent === moduleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    setFilteredLogs(filtered)
  }

  const verifyHashChain = async () => {
    setVerifying(true)
    try {
      // Verify hash chain integrity
      let validChain = true
      let checkedCount = 0

      for (let i = 0; i < logs.length - 1; i++) {
        const currentLog = logs[i]
        const nextLog = logs[i + 1]

        // Check if current log's prev_hash matches next log's output_hash
        if (currentLog.prev_hash && nextLog.output_hash) {
          if (currentLog.prev_hash !== nextLog.output_hash) {
            validChain = false
            break
          }
          checkedCount++
        }
      }

      setHashIntegrity({ valid: validChain, checked: checkedCount })
      
      toast({
        title: validChain ? "Chain Integrity Verified" : "Chain Integrity Broken",
        description: validChain 
          ? `Verified ${checkedCount} hash links` 
          : "Tampering detected in audit trail",
        variant: validChain ? "default" : "destructive",
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification failed", description: error.message })
    } finally {
      setVerifying(false)
    }
  }

  const exportLogs = async () => {
    const json = JSON.stringify(filteredLogs, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-trail-${new Date().toISOString()}.json`
    a.click()
    toast({ title: "Logs exported", description: "Download started" })
  }

  const modules = Array.from(new Set(logs.map(l => l.agent).filter(Boolean)))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Audit Trail</h1>
              <p className="text-sm text-muted-foreground">Hash-chained compliance logs</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={verifyHashChain} disabled={verifying || logs.length === 0} variant="outline">
              {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Verify Chain
            </Button>
            <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {hashIntegrity && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {hashIntegrity.valid ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold">Hash Chain Verified</p>
                      <p className="text-sm text-muted-foreground">
                        {hashIntegrity.checked} links verified - no tampering detected
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Chain Integrity Compromised</p>
                      <p className="text-sm text-muted-foreground">
                        Tampering detected in audit trail
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Recent compliance activity with filtering and search</CardDescription>
            
            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-3 pt-4">
              <div>
                <Label htmlFor="search" className="text-sm">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search action, module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="module" className="text-sm">Module</Label>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger id="module" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map(module => (
                      <SelectItem key={module} value={module}>{module}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredLogs.length === 0 ? (
              <p className="text-muted-foreground">No audit logs match your filters</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Input Hash</TableHead>
                      <TableHead>Output Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.agent || log.module}</Badge>
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>
                            {log.status || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.input_hash?.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.output_hash?.substring(0, 12)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuditTrail
