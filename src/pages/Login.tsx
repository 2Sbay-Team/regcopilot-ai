import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo"
import { Eye, EyeOff, ShieldAlert } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import ReCAPTCHA from "react-google-recaptcha"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analytics } from "@/lib/analytics"

const Login = () => {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Get reCAPTCHA site key from environment
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    // Track login page view
    analytics.trackPageView('login')
  }, [])

  // Check for account lockout
  useEffect(() => {
    const checkLockout = async () => {
      if (!email) return

      try {
        const { data, error } = await supabase.rpc('is_account_locked', {
          user_email: email
        })

        if (error) {
          console.error('Error checking lockout:', error)
          return
        }

        if (data && typeof data === 'object') {
          const lockInfo = data as { locked: boolean; lockout_until?: string; attempts?: number }
          setIsLocked(lockInfo.locked)
          
          if (lockInfo.locked && lockInfo.lockout_until) {
            const lockTime = new Date(lockInfo.lockout_until).getTime()
            setLockoutTime(lockTime)
          }

          // Show CAPTCHA if there have been failed attempts (even if not locked yet)
          if (lockInfo.attempts && lockInfo.attempts >= 3) {
            setShowCaptcha(true)
          }
        }
      } catch (err) {
        console.error('Error checking lockout:', err)
      }
    }

    if (email) {
      checkLockout()
    }
  }, [email, failedAttempts])

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutTime || !isLocked) return

    const interval = setInterval(() => {
      const now = Date.now()
      if (now >= lockoutTime) {
        setIsLocked(false)
        setLockoutTime(null)
        setFailedAttempts(0)
        setShowCaptcha(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTime, isLocked])

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token, email }
      })

      if (error) {
        console.error('CAPTCHA verification error:', error)
        return false
      }

      return data?.success === true
    } catch (error) {
      console.error('CAPTCHA verification failed:', error)
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if account is locked
    if (isLocked) {
      const remaining = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000 / 60) : 0
      toast({
        variant: "destructive",
        title: "Account Locked",
        description: `Account is temporarily locked. Please try again in ${remaining} minutes.`,
      })
      return
    }

    // Check if CAPTCHA is required but not completed
    if (showCaptcha && !captchaToken) {
      toast({
        variant: "destructive",
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification",
      })
      return
    }

    setLoading(true)

    try {
      // Verify CAPTCHA if required
      if (showCaptcha && captchaToken) {
        const captchaValid = await verifyCaptcha(captchaToken)
        if (!captchaValid) {
          toast({
            variant: "destructive",
            title: "CAPTCHA Failed",
            description: "CAPTCHA verification failed. Please try again.",
          })
          recaptchaRef.current?.reset()
          setCaptchaToken(null)
          setLoading(false)
          return
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Increment failed attempts
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)

        // Track failed login
        analytics.trackLogin({ method: 'email', success: false })

        // Log failed attempt
        await supabase.from('login_attempts').insert({
          user_email: email,
          ip_address: 'client', // Browser doesn't have direct IP access
          success: false
        })

        // Show CAPTCHA after 3 failed attempts
        if (newFailedAttempts >= 3) {
          setShowCaptcha(true)
          toast({
            variant: "destructive",
            title: "Security Check Required",
            description: `Login failed. Please complete CAPTCHA verification. (${newFailedAttempts} failed attempts)`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: `${error.message} (${newFailedAttempts}/3 attempts)`,
          })
        }

        // Reset CAPTCHA for next attempt
        if (recaptchaRef.current) {
          recaptchaRef.current.reset()
          setCaptchaToken(null)
        }

        return
      }

      // Success - log and reset
      analytics.trackLogin({ method: 'email', success: true })
      
      await supabase.from('login_attempts').insert({
        user_email: email,
        ip_address: 'client',
        success: true
      })

      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      })
      setFailedAttempts(0)
      setShowCaptcha(false)
      navigate("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 sm:p-6">
      <Card className="w-full max-w-md cockpit-panel shadow-xl border-primary/10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-5 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
              <RoboticShieldLogo size={68} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">RegSense Advisor</CardTitle>
          <CardDescription className="text-sm leading-relaxed px-2">
            AI-Powered Regulatory Intelligence — Effortless Compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('azure')}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                <path fill="#f25022" d="M0 0h11v11H0z"/>
                <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                <path fill="#7fba00" d="M0 12h11v11H0z"/>
                <path fill="#ffb900" d="M12 12h11v11H12z"/>
              </svg>
              Continue with Microsoft
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {isLocked && lockoutTime && (
              <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium ml-2">
                  Account temporarily locked due to multiple failed login attempts. 
                  Try again in {Math.ceil((lockoutTime - Date.now()) / 1000 / 60)} minutes.
                </AlertDescription>
              </Alert>
            )}

            {showCaptcha && !isLocked && (
              <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm font-medium ml-2">
                  Multiple failed login attempts detected. Please complete CAPTCHA verification.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isLocked}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isLocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {showCaptcha && !isLocked && (
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-medium" disabled={loading || isLocked}>
              {loading ? "Signing in..." : isLocked ? "Account Locked" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
