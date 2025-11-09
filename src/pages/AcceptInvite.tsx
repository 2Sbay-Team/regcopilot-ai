import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [inviteValid, setInviteValid] = useState(false)
  const [inviteData, setInviteData] = useState<any>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      checkInvite()
    } else {
      setLoading(false)
    }
  }, [token])

  const checkInvite = async () => {
    if (!token) return

    try {
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*, organizations(name)')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single()

      if (error || !data) {
        setInviteValid(false)
        toast({
          title: "Invalid Invite",
          description: "This invite link is invalid or has expired",
          variant: "destructive"
        })
      } else {
        // Check if not expired
        if (new Date(data.expires_at) < new Date()) {
          setInviteValid(false)
          toast({
            title: "Expired Invite",
            description: "This invite link has expired",
            variant: "destructive"
          })
        } else {
          setInviteValid(true)
          setInviteData(data)

          // If user is logged in, auto-accept
          if (user) {
            acceptInvite()
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking invite:', error)
      setInviteValid(false)
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    if (!user || !token) {
      // Redirect to signup with invite token
      navigate(`/signup?invite=${token}`)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('accept_organization_invite', {
        p_invite_token: token,
        p_user_id: user.id
      })

      if (error) throw error

      const result = data as { success: boolean; error?: string; organization_id?: string; role?: string }

      if (result.success) {
        toast({
          title: "Welcome!",
          description: "You've successfully joined the organization"
        })
        navigate('/dashboard')
      } else {
        throw new Error(result.error || 'Failed to accept invite')
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Checking invite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token || !inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Invite</CardTitle>
            </div>
            <CardDescription>
              This invite link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <CardTitle>Organization Invite</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join <strong>{inviteData?.organizations?.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Email: <strong>{inviteData?.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Role: <strong>{inviteData?.role}</strong>
            </p>
          </div>

          {user ? (
            <Button onClick={acceptInvite} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invite'
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button onClick={() => navigate(`/signup?invite=${token}`)} className="w-full">
                Sign Up to Accept
              </Button>
              <Button onClick={() => navigate(`/login?invite=${token}`)} variant="outline" className="w-full">
                Already have an account? Log in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
