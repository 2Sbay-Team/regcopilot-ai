import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { Shield, Copy, Check } from "lucide-react"
import { Label } from "@/components/ui/label"

const MFASetup = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Check if MFA is already enabled
    checkMFAStatus()
  }, [user, navigate])

  const checkMFAStatus = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('mfa_enabled')
      .eq('id', user.id)
      .single()

    if (data?.mfa_enabled) {
      navigate('/dashboard')
    } else {
      generateMFASecret()
    }
  }

  const generateMFASecret = async () => {
    try {
      // Call edge function to generate TOTP secret
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'generate' }
      })

      if (error) throw error

      setSecret(data.secret)
      setQrCode(data.qr_code)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate MFA secret"
      })
    }
  }

  const verifyAndEnable = async () => {
    if (!user || verificationCode.length !== 6) return

    setLoading(true)
    try {
      // Verify the TOTP code
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: {
          action: 'verify',
          secret,
          token: verificationCode
        }
      })

      if (error) throw error

      if (!data.valid) {
        throw new Error('Invalid verification code')
      }

      // Generate backup codes
      const { data: codesData, error: codesError } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'generate-backup-codes' }
      })

      if (codesError) throw codesError

      setBackupCodes(codesData.codes)
      setSetupComplete(true)

      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been enabled successfully"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid verification code"
      })
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard"
    })
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard"
    })
  }

  const finishSetup = () => {
    navigate('/dashboard')
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl cockpit-panel border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {setupComplete ? "Backup Codes" : "Enable Two-Factor Authentication"}
          </CardTitle>
          <CardDescription>
            {setupComplete 
              ? "Save these backup codes in a secure location"
              : "Enhance your account security with MFA"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!setupComplete ? (
            <>
              {qrCode && (
                <div className="space-y-4">
                  <div className="bg-card p-6 rounded-lg border border-border flex justify-center">
                    <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Or enter this code manually:</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                      <code className="flex-1">{secret}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copySecret}
                        className="shrink-0"
                      >
                        {copiedSecret ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Enter 6-digit code from your app:</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    onClick={verifyAndEnable}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    Verify and Enable MFA
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium mb-2">
                  ⚠️ Important: Save these codes securely
                </p>
                <p className="text-xs text-muted-foreground">
                  You'll need these codes if you lose access to your authenticator app.
                  Each code can only be used once.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Backup Codes:</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyBackupCodes}
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-background rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={finishSetup} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MFASetup
