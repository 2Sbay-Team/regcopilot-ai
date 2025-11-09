import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ source: string; section: string; similarity: number }>;
  articles?: Array<{ title: string; slug: string }>;
}

export function HelpChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI help assistant. I can answer questions about the platform using our documentation. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('help-assistant', {
        body: {
          query: input,
          language,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        articles: data.articles
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Help assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageIndex: number, helpful: boolean) => {
    const message = messages[messageIndex];
    if (message.role !== 'assistant') return;

    try {
      await supabase.from('help_feedback').insert({
        doc_path: 'chat_assistant',
        helpful,
        language
      });

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Help Assistant</h3>
          <Badge variant="secondary">Powered by RAG</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}

              <div className={`flex flex-col gap-2 max-w-[80%]`}>
                <Card className={`p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>

                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {message.sources.map((source, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {source.source} - {source.section}
                      </Badge>
                    ))}
                  </div>
                )}

                {message.role === 'assistant' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, true)}
                      className="h-6 px-2"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, false)}
                      className="h-6 px-2"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="p-3 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about the platform..."
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}