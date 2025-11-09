import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { validatePassword, DEFAULT_PASSWORD_POLICY } from "@/lib/passwordValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

const Signup = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Validate password on change
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password, DEFAULT_PASSWORD_POLICY);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailSchema = z.string().email("Invalid email address");
    const emailValidation = emailSchema.safeParse(email);

    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, DEFAULT_PASSWORD_POLICY);
    if (!passwordValidation.valid) {
      toast({
        title: "Weak Password",
        description: "Please fix all password requirements before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check for leaked password
      const { data: leakCheckData, error: leakCheckError } = await supabase.functions.invoke('password-leak-check', {
        body: { password }
      });

      if (leakCheckError) {
        console.warn('Password leak check unavailable:', leakCheckError);
        // Continue with signup even if check fails
      } else if (leakCheckData?.is_leaked) {
        toast({
          title: "Insecure Password Detected",
          description: `This password has been found in ${leakCheckData.breach_count} data breaches. Please choose a different password.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please login instead.');
        }
        throw error;
      }

      toast({
        title: "Account created!",
        description: "Welcome to Regulix. Your password will expire in 90 days.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google') => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md cockpit-panel">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl hover:shadow-lg transition-all">
              <RoboticShieldLogo size={64} />
            </div>
          </div>
          <CardTitle className="text-2xl">Join Regulix™</CardTitle>
          <CardDescription>
            Modern regulatory intelligence for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* OAuth Buttons */}
          <div className="space-y-3">
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
          </div>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              Or continue with email
            </span>
          </div>

          {/* Password Policy Info */}
          <Alert className="mb-4">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Password Requirements:</strong> At least 10 characters with uppercase, lowercase, numbers, and special characters. Passwords expire every 90 days.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
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
                  disabled={loading}
                  placeholder="Enter strong password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrengthMeter password={password} showFeedback={true} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Confirm your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Passwords do not match
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordErrors.length > 0 || password !== confirmPassword}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
