import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function RegulationUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [regulationType, setRegulationType] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch existing regulation versions
  const { data: regulations, refetch } = useQuery({
    queryKey: ['regulation-versions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulation_versions')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !regulationType || !version) {
      toast.error('Please fill all fields');
      return;
    }

    setUploading(true);

    try {
      // Get current user and organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      // Upload PDF to storage
      const fileName = `${regulationType}_v${version}_${Date.now()}.pdf`;
      const filePath = `${profile.organization_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('regulatory-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create regulation version record
      const { error: insertError } = await supabase
        .from('regulation_versions')
        .insert({
          organization_id: profile.organization_id,
          regulation_type: regulationType,
          version: version,
          file_path: filePath,
          uploaded_by: user.id,
          status: 'processing',
        });

      if (insertError) throw insertError;

      toast.success('Regulation uploaded! Processing started...');

      // Trigger processing edge function
      const { error: processError } = await supabase.functions.invoke('process-regulation-pdf', {
        body: {
          file_path: filePath,
          regulation_type: regulationType,
          version: version,
          organization_id: profile.organization_id,
        },
      });

      if (processError) {
        toast.error('Processing failed: ' + processError.message);
      } else {
        toast.success('Processing complete! Regulation is now active.');
      }

      // Reset form
      setSelectedFile(null);
      setRegulationType('');
      setVersion('');
      refetch();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Regulation Document Uploader</h1>
        <p className="text-muted-foreground">
          Upload official regulatory documents (EU AI Act, GDPR, CSRD) as PDFs. 
          The system will automatically parse, chunk, and generate embeddings for RAG retrieval.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Regulation</CardTitle>
          <CardDescription>
            Select a PDF file containing the official regulation text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regulation-type">Regulation Type</Label>
            <Select value={regulationType} onValueChange={setRegulationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select regulation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu_ai_act">EU AI Act</SelectItem>
                <SelectItem value="gdpr">GDPR</SelectItem>
                <SelectItem value="csrd">CSRD / ESRS</SelectItem>
                <SelectItem value="nis2">NIS2 Directive</SelectItem>
                <SelectItem value="dma">Digital Markets Act</SelectItem>
                <SelectItem value="dora">DORA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version / Date</Label>
            <Input
              id="version"
              placeholder="e.g., 2024-06-13 or v1.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">PDF Document</Label>
            <div className="flex gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !regulationType || !version || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Process
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Regulations</CardTitle>
          <CardDescription>History of processed regulation documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regulations?.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">
                      {reg.regulation_type.toUpperCase()} v{reg.version}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reg.uploaded_at).toLocaleDateString()} • {reg.chunks_count} chunks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reg.status === 'active' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Active</span>
                    </div>
                  )}
                  {reg.status === 'processing' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing</span>
                    </div>
                  )}
                  {reg.status === 'failed' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!regulations || regulations.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No regulations uploaded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}