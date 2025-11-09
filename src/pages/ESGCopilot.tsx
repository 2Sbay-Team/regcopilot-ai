import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Leaf, ArrowLeft, Loader2, Upload, X, FileText, HelpCircle, BookOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const ESGCopilot = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    period: "2024-FY",
    co2_scope1: "",
    co2_scope2: "",
    co2_scope3: "",
    energy_mwh: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate("/login")
      return
    }
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    setProfile(profileData)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (files.length + selectedFiles.length > 5) {
      toast({ variant: "destructive", title: "Too many files", description: "Maximum 5 files allowed" })
      return
    }
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    const uploaded: string[] = []
    
    for (const file of files) {
      const fileName = `${profile.organization_id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from("esg-documents")
        .upload(fileName, file)

      if (error) {
        toast({ variant: "destructive", title: "Upload failed", description: error.message })
        return null
      }
      uploaded.push(fileName)
    }

    return uploaded
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload files first
      let fileUrls: string[] = []
      if (files.length > 0) {
        const uploaded = await uploadFiles()
        if (!uploaded) {
          setLoading(false)
          return
        }
        fileUrls = uploaded
      }

      const { data, error } = await supabase.functions.invoke("esg-reporter", {
        body: {
          org_id: profile?.organization_id,
          data: {
            period: formData.period,
            co2_scope1: parseFloat(formData.co2_scope1) || 0,
            co2_scope2: parseFloat(formData.co2_scope2) || 0,
            co2_scope3: parseFloat(formData.co2_scope3) || 0,
            energy_mwh: parseFloat(formData.energy_mwh) || 0,
          },
          file_paths: fileUrls,
        },
      })

      if (error) throw error
      setResult(data)
      toast({ title: "ESG Report Generated", description: `Completeness: ${data.completeness_score}%` })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Report Failed", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-5 w-5" /></Button>
          <Leaf className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">ESG Reporter</h1>
            <p className="text-sm text-muted-foreground">CSRD/ESRS sustainability reporting</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Help Section */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              How to Use ESG Reporter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Reporting Period:</strong> Enter the fiscal year or reporting period (e.g., "2024-FY", "Q1-2025").
            </div>
            <div>
              <strong>Scope 1 Emissions:</strong> Direct emissions from owned/controlled sources (company vehicles, on-site fuel combustion). Measured in tonnes of CO2 equivalent (tCO2e).
            </div>
            <div>
              <strong>Scope 2 Emissions:</strong> Indirect emissions from purchased electricity, heating, and cooling. Measured in tCO2e.
            </div>
            <div>
              <strong>Scope 3 Emissions:</strong> All other indirect emissions in the value chain (business travel, employee commuting, purchased goods, waste). Measured in tCO2e.
            </div>
            <div>
              <strong>Energy Consumption:</strong> Total energy used in megawatt-hours (MWh). Include electricity, natural gas, and other energy sources.
            </div>
            <p className="text-muted-foreground mt-2">
              ℹ️ You can also upload CSV/Excel files with detailed emissions data. The AI will generate a CSRD/ESRS-compliant narrative.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ESG Metrics</CardTitle>
              <CardDescription>Enter your environmental data or upload CSV/Excel files</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <TooltipProvider>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="period">Reporting Period *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Enter the reporting period in format: YYYY-FY (fiscal year) or Q#-YYYY (quarter). Example: "2024-FY" or "Q1-2025"</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      id="period" 
                      value={formData.period} 
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })} 
                      placeholder="e.g., 2024-FY"
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Scope 1 Emissions (tCO2e) *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Direct greenhouse gas emissions from sources owned or controlled by your organization (company vehicles, facilities, manufacturing processes). Enter in tonnes of CO2 equivalent.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formData.co2_scope1} 
                      onChange={(e) => setFormData({ ...formData, co2_scope1: e.target.value })} 
                      placeholder="e.g., 125.50"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Scope 2 Emissions (tCO2e) *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Indirect emissions from purchased electricity, steam, heating and cooling. These are emissions from energy your company buys and uses.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formData.co2_scope2} 
                      onChange={(e) => setFormData({ ...formData, co2_scope2: e.target.value })} 
                      placeholder="e.g., 450.75"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Scope 3 Emissions (tCO2e) *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>All other indirect emissions in your value chain: business travel, employee commuting, purchased goods and services, waste disposal, product use, and end-of-life treatment.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formData.co2_scope3} 
                      onChange={(e) => setFormData({ ...formData, co2_scope3: e.target.value })} 
                      placeholder="e.g., 890.25"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Energy Consumption (MWh) *</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Total energy consumption in megawatt-hours. Include all energy sources: electricity, natural gas, heating oil, renewables, etc.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formData.energy_mwh} 
                      onChange={(e) => setFormData({ ...formData, energy_mwh: e.target.value })} 
                      placeholder="e.g., 1250.00"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Upload Data Files (Optional)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Upload detailed ESG data files (CSV, Excel, PDF) with additional sustainability metrics, supplier data, or environmental reports.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleFileSelect}
                      disabled={loading || files.length >= 5}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || files.length >= 5}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files ({files.length}/5)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supported: CSV, XLSX, XLS, PDF • Max 5 files
                    </p>
                  </div>
                </TooltipProvider>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Leaf className="mr-2 h-4 w-4" />Generate Report</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>ESG Narrative</CardTitle></CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{result.narrative}</p>
                  {result.report_id && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate(`/explainability?id=${result.report_id}&type=esg`)}
                    >
                      View Explainability
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Completeness Score</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{result.completeness_score}%</div></CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ESGCopilot
