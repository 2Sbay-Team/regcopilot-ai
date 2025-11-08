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
import { ArrowLeft, Shield, Users, Building } from "lucide-react"

const Admin = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [organization, setOrganization] = useState<any>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    checkAdminAccess()
  }, [user])

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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Role & organization management</p>
          </div>
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
      </div>
    </div>
  )
}

export default Admin
