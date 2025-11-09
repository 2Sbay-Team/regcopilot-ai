import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Zap, Loader2, AlertCircle } from "lucide-react"

interface AIGatewayTesterProps {
  organizationId: string
}

export const AIGatewayTester = ({ organizationId }: AIGatewayTesterProps) => {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const testGateway = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt"
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          org_id: organizationId,
          model: model,
          messages: [
            { role: 'system', content: 'You are a helpful compliance assistant.' },
            { role: 'user', content: prompt }
          ],
        }
      })

      if (error) throw error

      setResponse(data)

      toast({
        title: "Request Successful",
        description: `Model: ${data.model_used} • Cost: ${data.cost_estimate.toFixed(4)} USD`
      })
    } catch (error: any) {
      console.error('Gateway test error:', error)
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="cockpit-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Test AI Gateway
        </CardTitle>
        <CardDescription>
          Test model routing and cost tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">Select Model</Label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            disabled={loading}
          >
            <optgroup label="Google Gemini (Lovable AI)">
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash ($0.02/1K tokens)</option>
              <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite ($0.01/1K)</option>
              <option value="google/gemini-2.5-pro">Gemini 2.5 Pro ($0.05/1K)</option>
            </optgroup>
            <optgroup label="OpenAI GPT (Lovable AI)">
              <option value="openai/gpt-5-nano">GPT-5 Nano ($0.05/1K)</option>
              <option value="openai/gpt-5-mini">GPT-5 Mini ($0.10/1K)</option>
              <option value="openai/gpt-5">GPT-5 ($0.15/1K)</option>
            </optgroup>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Your Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Ask a question to test the AI gateway..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        <Button onClick={testGateway} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Send Request
            </>
          )}
        </Button>

        {response && (
          <div className="space-y-4 mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Response</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {response.model_used}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {response.usage.total_tokens} tokens
                </Badge>
                <Badge className="text-xs">
                  ${response.cost_estimate.toFixed(4)}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm whitespace-pre-wrap">{response.response}</p>
            </div>

            {response.budget_status && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="text-xs text-muted-foreground mb-1">Tokens Remaining</div>
                  <div className="text-lg font-bold">
                    {response.budget_status.tokens_remaining?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <div className="text-xs text-muted-foreground mb-1">Budget Remaining</div>
                  <div className="text-lg font-bold">
                    ${response.budget_status.cost_remaining?.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {response.audit_hash && (
              <div className="text-xs text-muted-foreground font-mono">
                Audit Hash: {response.audit_hash.substring(0, 16)}...
              </div>
            )}
          </div>
        )}

        {response?.error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-destructive mb-1">Error</p>
              <p className="text-muted-foreground">{response.error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
