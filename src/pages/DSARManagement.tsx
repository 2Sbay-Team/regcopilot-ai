import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DSARRequest {
  id: string
  data_subject_email: string
  request_type: string
  status: string
  created_at: string
  deadline: string
  days_remaining: number
  is_overdue: boolean
  dsar_responses: any[]
}

const DSARManagement = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<DSARRequest[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [email, setEmail] = useState('')
  const [requestType, setRequestType] = useState<'access' | 'rectification' | 'erasure' | 'portability' | 'restriction'>('access')

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.organization_id) {
      loadDSARs()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()
    setProfile(data)
  }

  const loadDSARs = async () => {
    if (!profile?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('dsar-workflow', {
        body: {
          org_id: profile.organization_id,
          action: 'list'
        }
      })

      if (error) throw error

      setRequests(data.requests || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading DSARs",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const createDSAR = async () => {
    if (!profile?.organization_id || !email) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('dsar-workflow', {
        body: {
          org_id: profile.organization_id,
          action: 'create',
          data: {
            email,
            request_type: requestType
          }
        }
      })

      if (error) throw error

      toast({
        title: "DSAR Created",
        description: `Deadline: ${data.days_remaining} days remaining`
      })

      setEmail('')
      loadDSARs()
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

  const fulfillDSAR = async (requestId: string) => {
    if (!profile?.organization_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('dsar-workflow', {
        body: {
          org_id: profile.organization_id,
          action: 'fulfill',
          data: {
            request_id: requestId,
            systems_to_search: ['CRM', 'Support', 'Analytics', 'Marketing']
          }
        }
      })

      if (error) throw error

      toast({
        title: "DSAR Fulfilled",
        description: `Found ${data.total_records} records across ${data.systems_searched} systems`
      })

      loadDSARs()
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

  const getStatusBadge = (request: DSARRequest) => {
    if (request.is_overdue) {
      return <Badge variant="destructive">Overdue</Badge>
    }
    if (request.status === 'fulfilled') {
      return <Badge className="bg-accent text-accent-foreground">Fulfilled</Badge>
    }
    if (request.days_remaining <= 7) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Due Soon</Badge>
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          DSAR Management
        </h1>
        <p className="text-muted-foreground font-medium">Automate Data Subject Access Requests (GDPR Art. 15-20)</p>
      </div>

      {/* Create New DSAR */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New DSAR
          </CardTitle>
          <CardDescription>30-day compliance deadline starts upon creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Data Subject Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="subject@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Request Type</Label>
              <select
                id="type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="access">Access (Art. 15)</option>
                <option value="rectification">Rectification (Art. 16)</option>
                <option value="erasure">Erasure (Art. 17)</option>
                <option value="portability">Data Portability (Art. 20)</option>
                <option value="restriction">Restriction (Art. 18)</option>
              </select>
            </div>
          </div>

          <Button onClick={createDSAR} disabled={loading || !email} className="w-full">
            Create DSAR Request
          </Button>
        </CardContent>
      </Card>

      {/* DSAR Queue */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle>Active DSAR Queue</CardTitle>
          <CardDescription>
            {requests.length} total requests • 
            {requests.filter(r => r.status === 'pending').length} pending • 
            {requests.filter(r => r.is_overdue).length} overdue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No DSAR requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{req.data_subject_email}</p>
                        <p className="text-sm text-muted-foreground capitalize">{req.request_type} Request</p>
                      </div>
                    </div>
                    {getStatusBadge(req)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{req.days_remaining} days remaining</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {req.is_overdue ? (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-accent" />
                        )}
                        <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => fulfillDSAR(req.id)}
                        disabled={loading}
                      >
                        Fulfill Request
                      </Button>
                    )}
                  </div>

                  {req.dsar_responses && req.dsar_responses.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        ✓ Fulfilled on {new Date(req.dsar_responses[0].fulfilled_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DSARManagement
