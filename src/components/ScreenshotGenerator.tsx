import { useState } from "react";
import { Camera, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const components = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'ai-act-copilot', label: 'AI Act Copilot' },
  { value: 'gdpr-copilot', label: 'GDPR Copilot' },
  { value: 'esg-copilot', label: 'ESG Copilot' },
  { value: 'connectors', label: 'Connectors' },
  { value: 'audit-trail', label: 'Audit Trail' },
  { value: 'reports', label: 'Reports' },
  { value: 'settings', label: 'Settings' }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' }
];

export function ScreenshotGenerator() {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const { toast } = useToast();
  const { language: userLanguage } = useLanguage();

  const handleGenerate = async () => {
    if (!selectedComponent) {
      toast({
        title: "Error",
        description: "Please select a component",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedUrl('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-screenshots-ai', {
        body: {
          component: selectedComponent,
          language: selectedLanguage
        }
      });

      if (error) throw error;

      if (data?.screenshot?.url) {
        setGeneratedUrl(data.screenshot.url);
        toast({
          title: "Success",
          description: "Screenshot generated successfully using AI!",
        });
      }
    } catch (error) {
      console.error('Screenshot generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate screenshot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          AI Screenshot Generator
        </h3>
        <p className="text-sm text-muted-foreground">
          Generate UI screenshots using AI for documentation purposes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Component</label>
          <Select value={selectedComponent} onValueChange={setSelectedComponent}>
            <SelectTrigger>
              <SelectValue placeholder="Select a component" />
            </SelectTrigger>
            <SelectContent>
              {components.map((comp) => (
                <SelectItem key={comp.value} value={comp.value}>
                  {comp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Language</label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !selectedComponent}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Screenshot...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Generate Screenshot
          </>
        )}
      </Button>

      {generatedUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Screenshot generated successfully!</span>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={generatedUrl} 
              alt={`Screenshot of ${selectedComponent}`}
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(generatedUrl, '_blank')}
            >
              Open in New Tab
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl);
                toast({
                  title: "Copied!",
                  description: "URL copied to clipboard"
                });
              }}
            >
              Copy URL
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
