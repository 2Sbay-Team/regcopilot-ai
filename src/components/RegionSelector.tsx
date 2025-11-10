import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Globe, MapPin, Server, Shield } from "lucide-react"

type DataRegion = 'eu' | 'us' | 'apac'

interface RegionInfo {
  id: DataRegion
  name: string
  flag: string
  location: string
  compliance: string[]
  description: string
}

const regions: RegionInfo[] = [
  {
    id: 'eu',
    name: 'European Union',
    flag: '🇪🇺',
    location: 'Frankfurt, Germany',
    compliance: ['GDPR', 'EU AI Act', 'CSRD/ESRS'],
    description: 'Full GDPR compliance, EU data residency, no third-country transfers'
  },
  {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    location: 'Virginia, USA',
    compliance: ['CCPA/CPRA', 'SOC 2 Type II', 'Privacy Shield'],
    description: 'California privacy laws, Standard Contractual Clauses for EU transfers'
  },
  {
    id: 'apac',
    name: 'Asia-Pacific',
    flag: '🌏',
    location: 'Singapore',
    compliance: ['PDPA', 'APPI (Japan)', 'PIPA (Korea)'],
    description: 'Regional data residency, cross-border data transfer safeguards'
  }
]

export function RegionSelector() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedRegion, setSelectedRegion] = useState<DataRegion>('eu')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadRegionPreference()
  }, [user])

  const loadRegionPreference = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data_region')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data?.data_region) {
        setSelectedRegion(data.data_region as DataRegion)
      }
    } catch (error) {
      console.error('Error loading region preference:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveRegionPreference = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ data_region: selectedRegion })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Region Updated",
        description: `Data residency set to ${regions.find(r => r.id === selectedRegion)?.name}. Your data will be processed in this region.`,
      })
    } catch (error) {
      console.error('Error saving region preference:', error)
      toast({
        title: "Error",
        description: "Failed to update region preference.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const currentRegion = regions.find(r => r.id === selectedRegion)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Data Residency</CardTitle>
        </div>
        <CardDescription>
          Choose where your data is stored and processed. Enterprise-grade security in all regions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Region</label>
          <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as DataRegion)} disabled={loading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center gap-2">
                    <span>{region.flag}</span>
                    <span>{region.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Region Details */}
        {currentRegion && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Data Center Location</p>
                <p className="text-sm text-muted-foreground">{currentRegion.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Infrastructure</p>
                <p className="text-sm text-muted-foreground">{currentRegion.description}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Compliance Standards</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {currentRegion.compliance.map((standard) => (
                    <span key={standard} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {standard}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">🔒 Enterprise Security in All Regions</p>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>✓ AES-256 encryption at rest</li>
            <li>✓ TLS 1.3 encryption in transit</li>
            <li>✓ SOC 2 Type II certified data centers</li>
            <li>✓ ISO 27001 information security</li>
            <li>✓ Regular security audits and penetration testing</li>
          </ul>
        </div>

        <Button onClick={saveRegionPreference} disabled={saving || loading} className="w-full">
          {saving ? "Saving..." : "Save Region Preference"}
        </Button>

        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Changing regions may require data migration. Contact support for enterprise migrations.
        </p>
      </CardContent>
    </Card>
  )
}
