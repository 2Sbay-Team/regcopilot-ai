import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Clock, CheckCircle, AlertCircle, Mail, Info, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InfoModal } from "@/components/InfoModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    if (user) {
      loadProfile()
    }
  }, [user])

  useEffect(() => {
    if (profile?.organization_id && user) {
      loadDSARs()
    }
  }, [profile, user])

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
    // Validate inputs
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email address is required"
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address"
      })
      return
    }

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DSAR Management
          </h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-6 w-6 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="font-semibold">DSAR (Data Subject Access Request)</p>
                <p className="mt-1">A formal request from an individual to access, rectify, erase, or port their personal data under GDPR Articles 15-20. Organizations must respond within 30 days.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-muted-foreground font-medium">Automate Data Subject Access Requests (GDPR Art. 15-20)</p>
      </div>

      {/* Create New DSAR */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New DSAR
          </CardTitle>
          <CardDescription>30-day compliance deadline starts upon creation (GDPR Art. 12.3)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Help Section */}
          <Alert className="bg-muted/50 border-border">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Data Subject Access Requests (DSARs) must be fulfilled within 30 days under GDPR. Create a request, then use "Fulfill Request" to automatically search your systems for the data subject's information.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="email">Data Subject Email *</Label>
                <InfoModal 
                  title="Data Subject Email"
                  description="The email address of the individual making the GDPR request. This will be used to search for their data across connected systems."
                  example="Examples:\n• john.doe@company.com\n• customer@email.com\n• former.employee@domain.com"
                />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="e.g., subject@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="type">Request Type</Label>
                <InfoModal 
                  title="GDPR Request Type"
                  description="Select the type of GDPR request. Each type has different legal requirements and processes."
                  example="• Access (Art. 15): Provide copy of personal data\n• Rectification (Art. 16): Correct inaccurate data\n• Erasure (Art. 17): Delete personal data ('Right to be forgotten')\n• Portability (Art. 20): Transfer data to another controller\n• Restriction (Art. 18): Limit data processing"
                />
              </div>
              <select
                id="type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="access">Access (Art. 15) - Provide data copy</option>
                <option value="rectification">Rectification (Art. 16) - Correct data</option>
                <option value="erasure">Erasure (Art. 17) - Delete data</option>
                <option value="portability">Data Portability (Art. 20) - Transfer data</option>
                <option value="restriction">Restriction (Art. 18) - Limit processing</option>
              </select>
            </div>
          </div>

          <Button onClick={createDSAR} disabled={loading || !email} className="w-full">
            {loading ? "Creating..." : "Create DSAR Request"}
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
