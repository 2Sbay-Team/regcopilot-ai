import { AppLayout } from "@/components/AppLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function AdminHelp() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Help & Documentation</h1>
          <p className="text-muted-foreground">Operations guides and technical documentation</p>
        </div>

        <Tabs defaultValue="runbook">
          <TabsList>
            <TabsTrigger value="runbook">Operations Runbook</TabsTrigger>
            <TabsTrigger value="user-guide">User Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="runbook" className="space-y-4">
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  Complete operations runbook available in repository: <code>docs/RUNBOOK.md</code>
                </p>
                <p>Key sections include:</p>
                <ul>
                  <li>Environment Configuration</li>
                  <li>Database Management</li>
                  <li>Edge Functions</li>
                  <li>Security & Compliance</li>
                  <li>Troubleshooting</li>
                  <li>SLOs & Monitoring</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="user-guide" className="space-y-4">
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  End-user documentation available in repository: <code>docs/USER_GUIDE.md</code>
                </p>
                <p>Key topics include:</p>
                <ul>
                  <li>Getting Started & Account Setup</li>
                  <li>Copilot Modules Overview</li>
                  <li>Feedback System</li>
                  <li>Admin Dashboard</li>
                  <li>Demo Scripts</li>
                  <li>FAQ</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
