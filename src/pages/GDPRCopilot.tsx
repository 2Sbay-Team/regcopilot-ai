import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileCheck, ArrowLeft, Loader2, AlertTriangle, Upload, X, FileText } from "lucide-react"

const GDPRCopilot = () => {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [documents, setDocuments] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
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
        .from("gdpr-documents")
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
    setResult(null)

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
        setUploadedFiles(uploaded)
      }

      const { data, error } = await supabase.functions.invoke("gdpr-checker", {
        body: {
          org_id: profile?.organization_id,
          payload: {
            documents: documents ? [documents] : [],
            file_paths: fileUrls,
          },
        },
      })

      if (error) throw error
      setResult(data)
      toast({
        title: "GDPR Check Complete",
        description: `Found ${data.violations.length} violations`,
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Check Failed", description: error.message })
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
          <FileCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">GDPR Checker</h1>
            <p className="text-sm text-muted-foreground">Scan for personal data & compliance issues</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Input</CardTitle>
              <CardDescription>Paste text or upload documents to scan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documents">Paste Documents (Optional)</Label>
                  <Textarea
                    id="documents"
                    value={documents}
                    onChange={(e) => setDocuments(e.target.value)}
                    placeholder="Paste employee data, vendor agreements, or other documents..."
                    disabled={loading}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Files (Optional)</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.csv"
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
                    Select Files ({files.length}/5)
                  </Button>
                </div>

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

                <Button type="submit" className="w-full" disabled={loading || (!documents && files.length === 0)}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : <><FileCheck className="mr-2 h-4 w-4" />Run GDPR Check</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {result && (
              <>
                {result.violations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Violations Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.violations.map((v: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-destructive pl-3">
                          <Badge variant="destructive">{v.article}</Badge>
                          <p className="text-sm mt-1">{v.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {result.findings.map((f: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-sm">{f.category}</p>
                          <Badge variant={f.severity === "high" ? "destructive" : "default"}>{f.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                    ))}
                    {result.assessment_id && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/explainability?id=${result.assessment_id}&type=gdpr`)}
                      >
                        View Explainability
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GDPRCopilot
