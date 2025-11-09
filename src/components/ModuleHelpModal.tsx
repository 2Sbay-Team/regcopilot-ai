import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, AlertCircle, PlayCircle, Book, Code } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModuleHelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    guide?: {
      overview: string
      steps: Array<{ title: string; description: string }>
      tips: string[]
      examples: Array<{ title: string; description: string; input: string; output: string }>
    }
    videoUrl?: string
  }
}

export const ModuleHelpModal = ({ open, onOpenChange, module }: ModuleHelpModalProps) => {
  const Icon = module.icon

  if (!module.guide) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {module.title}
            </DialogTitle>
            <DialogDescription>{module.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Documentation coming soon</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {module.title} - Documentation
          </DialogTitle>
          <DialogDescription>{module.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="tips">Best Practices</TabsTrigger>
            <TabsTrigger value="video">Video Tutorial</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="guide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {module.guide.overview}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {module.guide.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              {module.guide.examples.map((example, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{example.title}</CardTitle>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Input Example</span>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs overflow-x-auto">{example.input}</pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Expected Output</span>
                      </div>
                      <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                        <pre className="text-xs overflow-x-auto">{example.output}</pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tips" className="space-y-3">
              {module.guide.tips.map((tip, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              {module.videoUrl ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center space-y-3">
                        <PlayCircle className="h-16 w-16 text-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">Video tutorial loading...</p>
                        <Button asChild>
                          <a href={module.videoUrl} target="_blank" rel="noopener noreferrer">
                            Watch on YouTube
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <PlayCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Video tutorial coming soon</p>
                    <Badge variant="secondary">In Development</Badge>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
