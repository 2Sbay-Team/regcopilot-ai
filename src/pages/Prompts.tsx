import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, TestTube, Save, History, Sparkles } from "lucide-react"
import { format } from "date-fns"

const Prompts = () => {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<any[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [editedContent, setEditedContent] = useState("")
  const [testInput, setTestInput] = useState("")
  const [testOutput, setTestOutput] = useState("")
  const [testLoading, setTestLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .order('module', { ascending: true })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
      return
    }

    setPrompts(data || [])
    if (data && data.length > 0) {
      setSelectedPrompt(data[0])
      setEditedContent(data[0].content)
    }
  }

  const selectPrompt = (prompt: any) => {
    setSelectedPrompt(prompt)
    setEditedContent(prompt.content)
    setTestOutput("")
  }

  const savePrompt = async () => {
    if (!selectedPrompt) return

    setSaving(true)
    try {
      // Update prompt
      const { error } = await supabase
        .from('system_prompts')
        .update({
          content: editedContent,
          version: selectedPrompt.version + 1,
          last_modified: new Date().toISOString(),
          modified_by: user?.id
        })
        .eq('id', selectedPrompt.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Prompt updated successfully"
      })

      loadPrompts()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    } finally {
      setSaving(false)
    }
  }

  const testPrompt = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Test Input Required",
        description: "Please enter a test query",
        variant: "destructive"
      })
      return
    }

    setTestLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          org_id: user?.id, // Using user ID as org ID for testing
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: editedContent },
            { role: 'user', content: testInput }
          ]
        }
      })

      if (error) throw error

      setTestOutput(data.response || "No response received")
      
      toast({
        title: "Test Complete",
        description: `Used ${data.usage?.total_tokens || 0} tokens (Cost: $${data.cost_estimate?.toFixed(4) || 0})`
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Test Failed",
        description: error.message
      })
    } finally {
      setTestLoading(false)
    }
  }

  const getModuleIcon = (module: string) => {
    return <MessageSquare className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl tracking-tight mb-2 heading-dual-tone">
          System Prompt <span className="secondary">Manager</span>
        </h1>
        <p className="text-muted-foreground font-medium">
          Customize AI copilot behavior by editing system prompts
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Prompt List */}
        <Card className="lg:col-span-1 cockpit-panel">
          <CardHeader>
            <CardTitle className="text-sm">Copilot Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {prompts.map((prompt) => (
              <Button
                key={prompt.id}
                variant={selectedPrompt?.id === prompt.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => selectPrompt(prompt)}
              >
                {getModuleIcon(prompt.module)}
                <span className="ml-2 capitalize">{prompt.module.replace('_', ' ')}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3 cockpit-panel">
          {selectedPrompt ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {selectedPrompt.module.replace('_', ' ')} Copilot
                    </CardTitle>
                    <CardDescription>
                      Version {selectedPrompt.version} • Last modified {format(new Date(selectedPrompt.last_modified), 'MMM dd, yyyy HH:mm')}
                    </CardDescription>
                  </div>
                  <Button onClick={savePrompt} disabled={saving || editedContent === selectedPrompt.content}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="edit">Edit Prompt</TabsTrigger>
                    <TabsTrigger value="test">Test Prompt</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-content">System Prompt</Label>
                      <Textarea
                        id="prompt-content"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Enter system prompt..."
                      />
                      <p className="text-xs text-muted-foreground">
                        This prompt defines how the AI copilot behaves for this module.
                        Be specific about the task, format, and expected output.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-input">Test Query</Label>
                        <Textarea
                          id="test-input"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          className="min-h-[150px]"
                          placeholder="Enter a test query to see how the AI responds..."
                        />
                        <Button onClick={testPrompt} disabled={testLoading}>
                          <TestTube className="mr-2 h-4 w-4" />
                          {testLoading ? "Testing..." : "Test with Gemini Flash"}
                        </Button>
                      </div>

                      {testOutput && (
                        <div className="space-y-2">
                          <Label>AI Response</Label>
                          <div className="p-4 rounded-lg bg-muted border border-border">
                            <pre className="whitespace-pre-wrap text-sm">{testOutput}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a module to edit its prompt</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Prompts