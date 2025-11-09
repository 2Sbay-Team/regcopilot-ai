import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { t } from "@/lib/i18n"
import { Settings as SettingsIcon, Globe, DollarSign, User, Shield, ShieldCheck, ShieldOff, Key, Eye, EyeOff } from "lucide-react"
import { calculatePasswordStrength } from "@/lib/passwordValidation"

const Settings = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { language: currentLanguage, updateLanguage } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [currency, setCurrency] = useState<string>('USD')
  const [language, setLanguage] = useState<string>('en')
  const [fullName, setFullName] = useState<string>('')
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setCurrency(data.currency || 'USD')
      setLanguage(data.language || 'en')
      setFullName(data.full_name || '')
      setMfaEnabled(data.mfa_enabled || false)
    }
  }

  const saveSettings = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          currency,
          language,
          full_name: fullName,
        })
        .eq('id', user.id)

      if (error) throw error

      // Update language in context (instant UI update)
      await updateLanguage(language)

      toast({
        title: t('settings.changesSaved', language),
        description: t('settings.changesSavedDesc', language),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMFAToggle = async () => {
    if (mfaEnabled) {
      // Disable MFA
      setLoading(true)
      try {
        const { error } = await supabase.functions.invoke('mfa-setup', {
          body: { action: 'disable' }
        })

        if (error) throw error

        setMfaEnabled(false)
        toast({
          title: "MFA Disabled",
          description: "Two-factor authentication has been disabled"
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    } else {
      // Navigate to MFA setup
      navigate('/mfa-setup')
    }
  }

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all password fields"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match"
      })
      return
    }

    const validation = calculatePasswordStrength(newPassword)
    if (validation.score < 3) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Please choose a stronger password"
      })
      return
    }

    setLoading(true)
    try {
      // Check for leaked password
      const { data: leakCheckData, error: leakCheckError } = await supabase.functions.invoke('password-leak-check', {
        body: { password: newPassword, user_id: user?.id }
      })

      if (leakCheckError) {
        console.warn('Password leak check unavailable:', leakCheckError)
      } else if (leakCheckData?.is_leaked) {
        toast({
          title: "Insecure Password Detected",
          description: `This password has been found in ${leakCheckData.breach_count} data breaches. Please choose a different password.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors([])
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully"
      })
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

  useEffect(() => {
    if (newPassword) {
      const validation = calculatePasswordStrength(newPassword)
      setPasswordErrors(validation.feedback)
    } else {
      setPasswordErrors([])
    }
  }, [newPassword])

  return (
    <div className="space-y-6 p-6" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('settings.title', currentLanguage)}
        </h1>
        <p className="text-muted-foreground font-medium">
          {t('settings.subtitle', currentLanguage)}
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('settings.profile', currentLanguage)}
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('settings.name', currentLanguage)}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.email', currentLanguage)}</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              {t('settings.preferences', currentLanguage)}
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <Label htmlFor="currency">{t('settings.currencyLabel', currentLanguage)}</Label>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('settings.currencyDesc', currentLanguage)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label htmlFor="language">{t('settings.languageLabel', currentLanguage)}</Label>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('settings.languageDesc', currentLanguage)}
              </p>
            </div>

            <Button 
              onClick={saveSettings} 
              disabled={loading}
              className="w-full"
            >
              {t('settings.saveChanges', currentLanguage)}
            </Button>
          </CardContent>
        </Card>

        <Card className="cockpit-panel border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {mfaEnabled ? (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <ShieldOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Label className="text-base font-semibold">
                    Two-Factor Authentication
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled 
                    ? "Your account is protected with 2FA" 
                    : "Add an extra layer of security to your account"
                  }
                </p>
              </div>
              <Button
                onClick={handleMFAToggle}
                variant={mfaEnabled ? "outline" : "default"}
                disabled={loading}
              >
                {mfaEnabled ? "Disable" : "Enable"} MFA
              </Button>
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Change Password</Label>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordErrors.length > 0 && (
                    <div className="text-sm text-destructive space-y-1">
                      {passwordErrors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={loading || !newPassword || !confirmPassword || passwordErrors.length > 0}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings
