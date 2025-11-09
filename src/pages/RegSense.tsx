import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Brain, FileText, Shield, Leaf, AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";

type ContextScope = 'ai_act' | 'gdpr' | 'esg' | 'all';

interface Citation {
  source: string;
  section: string;
  content: string;
  similarity: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  metadata?: {
    model_used: string;
    fallback_used: boolean;
    response_time_ms: number;
    citations_count: number;
    scope: string;
  };
  timestamp: Date;
}

export default function RegSense() {
  const [scope, setScope] = useState<ContextScope>('all');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a compliance question",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('regsense-query', {
        body: { query: userMessage.content, scope },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        citations: data.citations,
        metadata: data.metadata,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Response Generated",
        description: `Answered using ${data.metadata.citations_count} regulatory references`,
      });

    } catch (error: any) {
      console.error('RegSense query error:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to process query: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Query Failed",
        description: error.message || "Failed to process compliance query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScopeIcon = (s: ContextScope) => {
    switch (s) {
      case 'ai_act': return <Brain className="h-4 w-4" />;
      case 'gdpr': return <Shield className="h-4 w-4" />;
      case 'esg': return <Leaf className="h-4 w-4" />;
      case 'all': return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getScopeLabel = (s: ContextScope) => {
    switch (s) {
      case 'ai_act': return 'EU AI Act';
      case 'gdpr': return 'GDPR';
      case 'esg': return 'ESG/CSRD';
      case 'all': return 'All Regulations';
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">RegSense</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Conversational Intelligence Layer for Compliance & ESG
          </p>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All responses are grounded in official EU regulations and cite specific articles. 
              Every query is logged for audit trail compliance.
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scope Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Context</CardTitle>
                <CardDescription>Select compliance domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['all', 'ai_act', 'gdpr', 'esg'] as ContextScope[]).map((s) => (
                  <Button
                    key={s}
                    variant={scope === s ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setScope(s)}
                  >
                    {getScopeIcon(s)}
                    <span className="ml-2">{getScopeLabel(s)}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Session Stats */}
            {messages.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Session Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queries:</span>
                    <span className="font-semibold">
                      {messages.filter(m => m.role === 'user').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Context:</span>
                    <Badge variant="outline">{getScopeLabel(scope)}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-16rem)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Dialogue
                </CardTitle>
                <CardDescription>
                  Ask questions about {getScopeLabel(scope)} in natural language
                </CardDescription>
              </CardHeader>
              
              {/* Messages */}
              <ScrollArea ref={scrollRef} className="flex-1 h-[calc(100%-12rem)] px-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Brain className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">Welcome to RegSense</p>
                    <p className="text-sm max-w-md">
                      Ask any compliance question and get answers grounded in official regulations 
                      with full citation transparency.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Citations */}
                          {message.citations && message.citations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                              <p className="text-xs font-semibold flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                References ({message.citations.length})
                              </p>
                              {message.citations.map((citation, idx) => (
                                <div key={idx} className="text-xs bg-background/50 p-2 rounded">
                                  <div className="font-semibold">{citation.source}</div>
                                  <div className="text-muted-foreground">{citation.section}</div>
                                  <div className="mt-1 text-xs opacity-75">{citation.content}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Metadata */}
                          {message.metadata && (
                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {message.metadata.response_time_ms}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {message.metadata.model_used.split('/')[1]}
                              </span>
                              {message.metadata.fallback_used && (
                                <Badge variant="outline" className="text-xs">Fallback</Badge>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <CardContent className="border-t">
                <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Ask about ${getScopeLabel(scope)} compliance...`}
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button type="submit" disabled={isLoading || !query.trim()} size="icon" className="h-[60px] w-[60px]">
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
