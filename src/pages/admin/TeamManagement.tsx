import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Mail, UserPlus, Shield, CheckCircle, XCircle, Clock, Trash2, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Invite {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
  invite_token: string
}

interface Domain {
  id: string
  domain: string
  verified: boolean
  verification_token: string
  created_at: string
}

export default function TeamManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [invites, setInvites] = useState<Invite[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("analyst")
  const [newDomain, setNewDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    loadInvites()
    loadDomains()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) return
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()
    setIsAdmin(!!data)
  }

  const loadInvites = async () => {
    const { data, error } = await supabase
      .from('organization_invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setInvites(data)
  }

  const loadDomains = async () => {
    const { data, error } = await supabase
      .from('organization_domains')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setDomains(data)
  }

  const sendInvite = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter an email address", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-organization-invite', {
        body: { email, role }
      })

      if (error) throw error

      toast({
        title: "Invite Sent",
        description: data.message
      })

      setEmail("")
      loadInvites()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async () => {
    if (!newDomain) {
      toast({ title: "Error", description: "Please enter a domain", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('verify-organization-domain', {
        body: { domain: newDomain, action: 'add' }
      })

      if (error) throw error

      toast({
        title: "Domain Added",
        description: data.message
      })

      setNewDomain("")
      loadDomains()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyDomain = async (domain: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('verify-organization-domain', {
        body: { domain, action: 'verify' }
      })

      if (error) throw error

      toast({
        title: "Domain Verified",
        description: data.message
      })

      loadDomains()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Copied to clipboard" })
  }

  const cancelInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('organization_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)

    if (!error) {
      toast({ title: "Success", description: "Invite cancelled" })
      loadInvites()
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You need admin privileges to access team management.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Team Management</h1>
        <p className="text-muted-foreground">Invite team members and manage organization domains</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Send invitations to colleagues to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={sendInvite} disabled={loading} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Pending Invites</h3>
            {invites.filter(i => i.status === 'pending').length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending invites</p>
            ) : (
              <div className="space-y-2">
                {invites.filter(i => i.status === 'pending').map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {invite.role} • Expires: {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/accept-invite?token=${invite.invite_token}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelInvite(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Domain Verification
          </CardTitle>
          <CardDescription>
            Verify your company domain so employees can automatically join your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="company.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <Button onClick={addDomain} disabled={loading}>
              Add Domain
            </Button>
          </div>

          <div className="space-y-2">
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">No domains configured</p>
            ) : (
              domains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{domain.domain}</p>
                      {domain.verified ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    {!domain.verified && (
                      <div className="mt-2 text-sm">
                        <p className="text-muted-foreground">Add this TXT record to verify:</p>
                        <code className="block mt-1 p-2 bg-muted rounded text-xs">
                          regulix-verify={domain.verification_token}
                        </code>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!domain.verified && (
                      <Button size="sm" onClick={() => verifyDomain(domain.domain)}>
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
