import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, FileText } from "lucide-react"

interface FileUploadProps {
  bucket: string
  organizationId: string
  onUploadComplete?: (files: string[]) => void
  accept?: string
  maxFiles?: number
}

const FileUpload = ({ bucket, organizationId, onUploadComplete, accept, maxFiles = 5 }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
      })
      return
    }

    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload Documents</Label>
        <div className="mt-2">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading || files.length >= maxFiles}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || files.length >= maxFiles}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Files ({files.length}/{maxFiles})
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Selected Files</Label>
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
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
