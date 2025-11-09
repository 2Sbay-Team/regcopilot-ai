import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function UploadPolicies() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizationId, setOrganizationId] = useState<string>('')
  
  const [policy, setPolicy] = useState({
    ai_act_enabled: true,
    gdpr_enabled: true,
    esg_enabled: true,
    allowed_types: ['pdf', 'docx', 'xlsx', 'doc', 'xls', 'csv'],
    allow_embeddings: true,
    retention_days: 365,
    max_file_size_mb: 25,
  })

  useEffect(() => {
    loadPolicy()
  }, [])

  const loadPolicy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')
      setOrganizationId(profile.organization_id)

      const { data: policyData, error } = await supabase
        .from('upload_policies')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (policyData) {
        setPolicy({
          ai_act_enabled: policyData.ai_act_enabled,
          gdpr_enabled: policyData.gdpr_enabled,
          esg_enabled: policyData.esg_enabled,
          allowed_types: policyData.allowed_types || [],
          allow_embeddings: policyData.allow_embeddings,
          retention_days: policyData.retention_days,
          max_file_size_mb: policyData.max_file_size_mb,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error loading policies",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('upload_policies')
        .upsert({
          organization_id: organizationId,
          ...policy,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Log policy change
      await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        agent: 'admin',
        action: 'update_upload_policy',
        event_type: 'upload_policy_update',
        status: 'success',
        input_hash: user.id,
        output_hash: organizationId,
        request_payload: policy,
      })

      toast({
        title: "Policies Updated",
        description: "Upload policies have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error saving policies",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Policies</h1>
          <p className="text-muted-foreground">Configure document upload and RAG settings</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Module Upload Settings
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enable or disable document uploads for each compliance module
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="ai-act-enabled" className="text-base font-medium">
                  AI Act Auditor
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to upload Annex IV documentation and technical specifications
                </p>
              </div>
              <Switch
                id="ai-act-enabled"
                checked={policy.ai_act_enabled}
                onCheckedChange={(checked) => setPolicy({ ...policy, ai_act_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="gdpr-enabled" className="text-base font-medium">
                  GDPR Checker
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to upload privacy policies, DPIAs, and vendor contracts
                </p>
              </div>
              <Switch
                id="gdpr-enabled"
                checked={policy.gdpr_enabled}
                onCheckedChange={(checked) => setPolicy({ ...policy, gdpr_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="esg-enabled" className="text-base font-medium">
                  ESG Reporter
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to upload sustainability reports and ESG data sheets
                </p>
              </div>
              <Switch
                id="esg-enabled"
                checked={policy.esg_enabled}
                onCheckedChange={(checked) => setPolicy({ ...policy, esg_enabled: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">RAG & Storage Settings</h2>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="embeddings" className="text-base font-medium">
                Generate Embeddings
              </Label>
              <p className="text-sm text-muted-foreground">
                Create vector embeddings for intelligent document search and RAG
              </p>
            </div>
            <Switch
              id="embeddings"
              checked={policy.allow_embeddings}
              onCheckedChange={(checked) => setPolicy({ ...policy, allow_embeddings: checked })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-size">Maximum File Size (MB)</Label>
              <Input
                id="max-size"
                type="number"
                min="1"
                max="100"
                value={policy.max_file_size_mb}
                onChange={(e) => setPolicy({ ...policy, max_file_size_mb: parseInt(e.target.value) || 25 })}
              />
              <p className="text-xs text-muted-foreground">Recommended: 25MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Retention Period (Days)</Label>
              <Input
                id="retention"
                type="number"
                min="1"
                max="3650"
                value={policy.retention_days}
                onChange={(e) => setPolicy({ ...policy, retention_days: parseInt(e.target.value) || 365 })}
              />
              <p className="text-xs text-muted-foreground">Auto-delete files after this period</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allowed File Types</Label>
            <div className="flex flex-wrap gap-2">
              {['pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv'].map((type) => (
                <Badge
                  key={type}
                  variant={policy.allowed_types.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setPolicy({
                      ...policy,
                      allowed_types: policy.allowed_types.includes(type)
                        ? policy.allowed_types.filter((t) => t !== type)
                        : [...policy.allowed_types, type],
                    })
                  }}
                >
                  .{type}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Click to toggle file types</p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
          </Button>
        </div>
      </Card>
    </div>
  )
}