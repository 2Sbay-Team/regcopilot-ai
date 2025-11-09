import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Shield, Users, Building, FileText, CheckCircle, AlertCircle, Rocket } from "lucide-react"
import { AdminOnboardingWizard } from "@/components/AdminOnboardingWizard"

const Admin = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [organization, setOrganization] = useState<any>(null)
  const [showWizard, setShowWizard] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    checkAdminAccess()
  }, [user])

  useEffect(() => {
    // Check if wizard should be shown for first-time admin
    const wizardCompleted = localStorage.getItem('admin_wizard_completed')
    const wizardSkipped = localStorage.getItem('admin_wizard_skipped')
    
    if (isAdmin && !wizardCompleted && !wizardSkipped) {
      setShowWizard(true)
    }
  }, [isAdmin])

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    try {
      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)

      const hasAdmin = roles?.some(r => r.role === "admin")
      
      if (!hasAdmin) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be an admin to access this page",
        })
        navigate("/dashboard")
        return
      }

      setIsAdmin(true)
      await loadData()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user?.id)
        .single()

      setOrganization(profile?.organizations)

      // Get all users in the organization
      const { data: orgUsers } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .eq("organization_id", profile?.organization_id)

      // Get roles for all users
      const userIds = orgUsers?.map(u => u.id) || []
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)

      // Combine data
      const usersWithRoles = orgUsers?.map(u => ({
        ...u,
        roles: userRoles?.filter(r => r.user_id === u.id).map(r => r.role) || [],
      }))

      setUsers(usersWithRoles || [])
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to load data", description: error.message })
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Remove existing roles for this user
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)

      // Add new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ 
          user_id: userId, 
          role: newRole as "admin" | "analyst" | "auditor" | "viewer"
        }])

      if (error) throw error

      toast({
        title: "Role Updated",
        description: "User role has been successfully changed",
      })

      await loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error.message,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminOnboardingWizard open={showWizard} onClose={() => setShowWizard(false)} />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Role & organization management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowWizard(true)} className="gap-2">
            <Rocket className="h-4 w-4" />
            Quick Start Guide
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div>
                <span className="font-semibold">Name: </span>
                <span>{organization?.name}</span>
              </div>
              <div>
                <span className="font-semibold">Country: </span>
                <span>{organization?.country_code || "Not set"}</span>
              </div>
              <div>
                <span className="font-semibold">Plan: </span>
                <Badge>{organization?.plan || "free"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Tools</CardTitle>
            <CardDescription>Quick access to admin features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/regulations')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Regulation Uploader
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Upload & manage official regulatory PDFs for RAG system</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/guide')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Admin Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Complete onboarding guide for administrators</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/model-registry')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Model Registry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage AI models and compliance tracking</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage roles for users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Change Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-mono text-sm">{usr.email}</TableCell>
                      <TableCell>{usr.full_name || "-"}</TableCell>
                      <TableCell>
                        {usr.roles.map((role: string) => (
                          <Badge key={role} variant={role === "admin" ? "default" : "outline"}>
                            {role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={usr.roles[0] || "analyst"}
                          onValueChange={(value) => handleRoleChange(usr.id, value)}
                          disabled={usr.id === user?.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(usr.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Automated Reports Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Automated Report Scheduling
            </CardTitle>
            <CardDescription>
              Configure automatic compliance report generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <div className="font-medium">Monthly Unified Reports</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically generate compliance reports on the 1st of every month at 9:00 AM UTC
                  </div>
                </div>
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Automated Scheduling Enabled
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      Pro and Enterprise plan organizations will receive automated monthly reports
                      combining AI Act, GDPR, and ESG compliance data. Reports are stored in the Reports page.
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-xs">
                      Schedule: 1st day of each month at 9:00 AM UTC
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Admin