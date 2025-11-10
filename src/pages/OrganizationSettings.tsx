import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { AppLayout } from "@/components/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Globe,
  UserCircle,
  Briefcase
} from "lucide-react"

interface Organization {
  id: string
  name: string
  country_code: string
  subscription_plan: string
  billing_status?: string
  llm_token_quota: number
  tokens_used_this_month: number
  billing_model: string
  industry?: string
  company_size?: string
}

interface TeamMember {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

const OrganizationSettings = () => {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Form states
  const [orgName, setOrgName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [industry, setIndustry] = useState("")
  const [companySize, setCompanySize] = useState("")

  useEffect(() => {
    checkAdminStatus()
    loadOrganization()
    loadTeamMembers()
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

  const loadOrganization = async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        const { data: org, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()

        if (error) throw error

        setOrganization(org)
        setOrgName(org.name || '')
        setCountryCode(org.country_code || 'US')
        setIndustry(org.industry || '')
        setCompanySize(org.company_size || '')
      }
    } catch (error) {
      console.error('Failed to load organization:', error)
      toast.error('Failed to load organization details')
    }
  }

  const loadTeamMembers = async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profile?.organization_id) {
        const { data: members, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            created_at
          `)
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Get roles for each member
        const membersWithRoles = await Promise.all(
          (members || []).map(async (member) => {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', member.id)

            return {
              ...member,
              role: roles?.[0]?.role || 'analyst'
            }
          })
        )

        setTeamMembers(membersWithRoles)
      }
    } catch (error) {
      console.error('Failed to load team members:', error)
    }
  }

  const saveOrganization = async () => {
    if (!organization || !isAdmin) {
      toast.error('You need admin privileges to update organization settings')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgName,
          country_code: countryCode,
          industry,
          company_size: companySize
        })
        .eq('id', organization.id)

      if (error) throw error

      toast.success('Organization settings updated successfully')
      loadOrganization()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update organization')
    } finally {
      setLoading(false)
    }
  }

  if (!organization) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Building2 className="h-8 w-8 animate-pulse text-primary" />
        </div>
      </AppLayout>
    )
  }

  const usagePercent = organization.llm_token_quota 
    ? Math.min(100, (organization.tokens_used_this_month / organization.llm_token_quota) * 100)
    : 0

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization profile and team
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Organization Profile
                </CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAdmin && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need admin privileges to edit organization settings. Contact your organization admin.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={!isAdmin || loading}
                    placeholder="ACME Corporation"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={countryCode} 
                      onValueChange={setCountryCode}
                      disabled={!isAdmin || loading}
                    >
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                        <SelectItem value="IT">Italy</SelectItem>
                        <SelectItem value="NL">Netherlands</SelectItem>
                        <SelectItem value="SE">Sweden</SelectItem>
                        <SelectItem value="NO">Norway</SelectItem>
                        <SelectItem value="DK">Denmark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={industry} 
                      onValueChange={setIndustry}
                      disabled={!isAdmin || loading}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select 
                    value={companySize} 
                    onValueChange={setCompanySize}
                    disabled={!isAdmin || loading}
                  >
                    <SelectTrigger id="companySize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAdmin && (
                  <Button 
                    onClick={saveOrganization} 
                    disabled={loading}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                  <Badge variant="secondary">{teamMembers.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Active members in your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name || member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                        {member.id === user?.id && (
                          <Badge variant="default">You</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                    <p className="text-sm text-muted-foreground mb-2">
                      Need to add more team members?
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/admin/team">Manage Team Invitations</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Usage
                </CardTitle>
                <CardDescription>
                  Current plan and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current Plan</Label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={organization.subscription_plan === 'free' ? 'secondary' : 'default'}
                        className="text-base py-1 capitalize"
                      >
                        {organization.subscription_plan}
                      </Badge>
                      {organization.billing_status && (
                        <Badge variant="outline">
                          {organization.billing_status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Model</Label>
                    <Badge variant="outline" className="text-base py-1 capitalize">
                      {organization.billing_model === 'byok' ? 'Bring Your Own Key' : 'Managed'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Monthly Token Usage</Label>
                    <span className="text-muted-foreground">
                      {organization.tokens_used_this_month.toLocaleString()} / {organization.llm_token_quota.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        usagePercent >= 90 ? 'bg-destructive' : 
                        usagePercent >= 80 ? 'bg-yellow-500' : 
                        'bg-primary'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usagePercent >= 90 ? '⚠️ Critical: ' : usagePercent >= 80 ? '⚠️ Warning: ' : ''}
                    {usagePercent.toFixed(1)}% of monthly quota used
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href="/billing">Manage Billing</a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="/usage">View Usage Details</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>
                  Organization-wide security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Label className="text-base font-semibold">Data Encryption</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All data encrypted at rest and in transit
                      </p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <Label className="text-base font-semibold">Data Region</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Primary: {countryCode === 'US' ? 'United States' : 'European Union'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/settings">Configure</a>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <Label className="text-base font-semibold">Audit Logging</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Complete audit trail with hash-chain verification
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/audit">View Logs</a>
                    </Button>
                  </div>
                </div>

                {isAdmin && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      For advanced security settings and domain verification, visit{" "}
                      <a href="/admin/team" className="underline font-medium">
                        Team Management
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

export default OrganizationSettings
