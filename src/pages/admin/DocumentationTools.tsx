import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScreenshotGenerator } from "@/components/ScreenshotGenerator";
import { Button } from "@/components/ui/button";
import { Camera, FileText, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DocumentationTools() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateDocs = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-docs', {
        body: {
          includeScreenshots: true,
          languages: ['en', 'de', 'fr', 'ar'],
          includeExamples: true,
          outputFormat: 'markdown'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Generated ${data.articlesGenerated} help articles across ${data.languages.length} languages`,
      });
    } catch (error) {
      console.error('Documentation generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate documentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documentation Tools</h1>
          <p className="text-muted-foreground">
            Generate and manage multilingual documentation and screenshots
          </p>
        </div>

        <Tabs defaultValue="screenshots" className="space-y-6">
          <TabsList>
            <TabsTrigger value="screenshots" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Screenshot Generator
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screenshots" className="space-y-4">
            <ScreenshotGenerator />

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">About AI Screenshot Generation</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This tool uses the Lovable AI Gateway (Nano banana model) to generate realistic UI screenshots 
                  for documentation purposes.
                </p>
                <p>
                  <strong>Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Multi-language support (English, German, French, Arabic)</li>
                  <li>Component-specific descriptions for accurate generation</li>
                  <li>Automatic upload to Supabase Storage</li>
                  <li>RTL support for Arabic UI screenshots</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Help Article Generator
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate comprehensive help articles in multiple languages with RAG embeddings
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Languages Supported</h4>
                    <ul className="space-y-1 text-sm">
                      <li>🇬🇧 English (EN)</li>
                      <li>🇩🇪 German (DE)</li>
                      <li>🇫🇷 French (FR)</li>
                      <li>🇸🇦 Arabic (AR)</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Generated Content</h4>
                    <ul className="space-y-1 text-sm">
                      <li>✅ Getting Started Guide</li>
                      <li>✅ AI Act Copilot Guide</li>
                      <li>✅ Connectors Documentation</li>
                      <li>✅ RAG Embeddings</li>
                    </ul>
                  </Card>
                </div>

                <Button 
                  onClick={handleGenerateDocs} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Documentation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Help Articles
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Note:</strong> This process will:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Generate help articles in EN, DE, FR, and AR</li>
                    <li>Create RAG embeddings for AI-powered search</li>
                    <li>Update the document_chunks table for the help assistant</li>
                    <li>Log the generation in the audit trail</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-950">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Documentation Best Practices
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Regenerate docs after major feature releases</li>
                    <li>• Keep translations consistent across all languages</li>
                    <li>• Monitor Help Insights to identify missing topics</li>
                    <li>• Test RAG search quality after regeneration</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
