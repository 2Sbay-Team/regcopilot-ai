import { useState, useEffect } from "react"
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
import { Settings as SettingsIcon, Globe, DollarSign, User } from "lucide-react"

const Settings = () => {
  const { user } = useAuth()
  const { language: currentLanguage, updateLanguage } = useLanguage()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [currency, setCurrency] = useState<string>('USD')
  const [language, setLanguage] = useState<string>('en')
  const [fullName, setFullName] = useState<string>('')

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
      </div>
    </div>
  )
}

export default Settings
