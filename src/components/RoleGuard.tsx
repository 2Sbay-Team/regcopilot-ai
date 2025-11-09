import { ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: string | string[]
  organizationOnly?: boolean
  fallbackPath?: string
}

const RoleGuard = ({ 
  children, 
  requiredRole, 
  organizationOnly = false,
  fallbackPath = "/dashboard" 
}: RoleGuardProps) => {
  const { user, loading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        // Get user's roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)

        if (rolesError) throw rolesError

        const roles = userRoles?.map(r => r.role) || []

        // Check super admin first (has access to everything)
        if (roles.includes('super_admin')) {
          setHasAccess(true)
          setLoading(false)
          return
        }

        // Check if organization access required
        if (organizationOnly) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

          if (!profile?.organization_id) {
            setError('No organization found. Please contact support.')
            setHasAccess(false)
            setLoading(false)
            return
          }
        }

        // Check specific role requirements
        if (requiredRole) {
          const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          const hasRequiredRole = requiredRoles.some(role => roles.includes(role))
          
          setHasAccess(hasRequiredRole)
          
          if (!hasRequiredRole) {
            setError(`Access denied. Required role: ${requiredRoles.join(' or ')}`)
          }
        } else {
          setHasAccess(true)
        }

        setLoading(false)
      } catch (err) {
        console.error('Access check error:', err)
        setError('Failed to verify access permissions')
        setHasAccess(false)
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAccess()
    }
  }, [user, authLoading, requiredRole, organizationOnly])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error || 'You do not have permission to access this page.'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <a 
              href={fallbackPath}
              className="text-primary hover:underline"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default RoleGuard
