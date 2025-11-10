import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  Copy, 
  Github, 
  GitlabIcon,
  Webhook,
  Shield,
  AlertTriangle,
  BookOpen,
  Key,
  Settings
} from "lucide-react"
import { toast } from "sonner"

const CICDSetup = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const githubWorkflow = `name: Security Scan

on:
  push:
    branches: [main, master]
  pull_request:
  schedule:
    - cron: '0 2 * * *'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Security Scan
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: \${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          curl -X POST "$SUPABASE_URL/functions/v1/vulnerability-scanner" \\
            -H "Authorization: Bearer $SUPABASE_KEY" \\
            -H "Content-Type: application/json" \\
            -d '{"scan_type":"full","source":"github_actions"}'`

  const gitlabPipeline = `stages:
  - security

security-scan:
  stage: security
  image: curlimages/curl:latest
  script:
    - |
      curl -X POST "$SUPABASE_URL/functions/v1/vulnerability-scanner" \\
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \\
        -H "Content-Type: application/json" \\
        -d '{"scan_type":"full","source":"gitlab_ci"}'
  only:
    - main
    - merge_requests`

  const webhookExample = `curl -X POST "${supabaseUrl}/functions/v1/vulnerability-scanner" \\
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"scan_type":"full","source":"custom_ci"}'`

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CI/CD Security Integration</h1>
        <p className="text-muted-foreground">
          Automate security scans on every deployment
        </p>
      </div>

      {/* Quick Start Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Automated Security Pipeline</AlertTitle>
        <AlertDescription>
          Integrate security scanning into your CI/CD pipeline to catch vulnerabilities before they reach production.
          Supports GitHub Actions, GitLab CI, and custom webhooks.
        </AlertDescription>
      </Alert>

      {/* Integration Options */}
      <Tabs defaultValue="github" className="space-y-4">
        <TabsList>
          <TabsTrigger value="github">
            <Github className="h-4 w-4 mr-2" />
            GitHub Actions
          </TabsTrigger>
          <TabsTrigger value="gitlab">
            <GitlabIcon className="h-4 w-4 mr-2" />
            GitLab CI
          </TabsTrigger>
          <TabsTrigger value="webhook">
            <Webhook className="h-4 w-4 mr-2" />
            Custom Webhook
          </TabsTrigger>
        </TabsList>

        {/* GitHub Actions */}
        <TabsContent value="github" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Actions Setup</CardTitle>
              <CardDescription>
                Automatic security scans on every push and pull request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 1</Badge>
                  <h3 className="font-semibold">Add GitHub Secrets</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to: <strong>Settings → Secrets and variables → Actions → New repository secret</strong>
                </p>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">SUPABASE_URL</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(supabaseUrl, 'url')}
                      >
                        {copiedKey === 'url' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground break-all">{supabaseUrl}</code>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">SUPABASE_ANON_KEY</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(supabaseAnonKey, 'anon')}
                      >
                        {copiedKey === 'anon' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground break-all">{supabaseAnonKey}</code>
                  </div>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Service Role Key Required</AlertTitle>
                    <AlertDescription>
                      You'll also need to add <code>SUPABASE_SERVICE_ROLE_KEY</code>. Get it from your Lovable Cloud backend settings.
                      <strong> Never commit this key to your repository!</strong>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 2</Badge>
                  <h3 className="font-semibold">Create Workflow File</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  The workflow file is already created at <code>.github/workflows/security-scan.yml</code>
                </p>
                <div className="bg-muted rounded-lg p-4 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(githubWorkflow, 'github-workflow')}
                  >
                    {copiedKey === 'github-workflow' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-xs overflow-x-auto">
                    <code>{githubWorkflow}</code>
                  </pre>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 3</Badge>
                  <h3 className="font-semibold">Enable Branch Protection (Recommended)</h3>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground ml-4">
                  <li>• Go to <strong>Settings → Branches → Add rule</strong></li>
                  <li>• Require status checks to pass before merging</li>
                  <li>• Select security scan checks</li>
                  <li>• Block merge if critical vulnerabilities found</li>
                </ul>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>You're all set!</AlertTitle>
                <AlertDescription>
                  Security scans will now run automatically on every push and pull request.
                  View results in the Security Center.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GitLab CI */}
        <TabsContent value="gitlab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GitLab CI Setup</CardTitle>
              <CardDescription>
                Automatic security scans in your GitLab pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 1</Badge>
                  <h3 className="font-semibold">Add CI/CD Variables</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Go to: <strong>Settings → CI/CD → Variables → Add variable</strong>
                </p>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">SUPABASE_URL</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(supabaseUrl, 'gitlab-url')}
                      >
                        {copiedKey === 'gitlab-url' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground break-all">{supabaseUrl}</code>
                  </div>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Service Role Key Required</AlertTitle>
                    <AlertDescription>
                      Add <code>SUPABASE_SERVICE_ROLE_KEY</code> as a protected and masked variable.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 2</Badge>
                  <h3 className="font-semibold">Create Pipeline File</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  The pipeline file is already created at <code>.gitlab-ci.yml</code>
                </p>
                <div className="bg-muted rounded-lg p-4 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(gitlabPipeline, 'gitlab-pipeline')}
                  >
                    {copiedKey === 'gitlab-pipeline' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-xs overflow-x-auto">
                    <code>{gitlabPipeline}</code>
                  </pre>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Step 3</Badge>
                  <h3 className="font-semibold">Configure Schedule (Optional)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>CI/CD → Schedules</strong> to run daily security scans at 2 AM
                </p>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Pipeline Ready!</AlertTitle>
                <AlertDescription>
                  Security scans will run on every commit to main and merge requests.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Webhook */}
        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Webhook Integration</CardTitle>
              <CardDescription>
                Integrate with any CI/CD platform using webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Available Endpoints</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Vulnerability Scanner</h4>
                      <Badge>POST</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground break-all block mb-2">
                      {supabaseUrl}/functions/v1/vulnerability-scanner
                    </code>
                    <p className="text-sm text-muted-foreground">
                      Scans for security vulnerabilities in your application
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Dependency Scanner</h4>
                      <Badge>POST</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground break-all block mb-2">
                      {supabaseUrl}/functions/v1/dependency-scanner
                    </code>
                    <p className="text-sm text-muted-foreground">
                      Checks dependencies for known CVEs and vulnerabilities
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Security Report Generator</h4>
                      <Badge>POST</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground break-all block mb-2">
                      {supabaseUrl}/functions/v1/generate-security-report
                    </code>
                    <p className="text-sm text-muted-foreground">
                      Generates comprehensive security and compliance reports
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Example cURL Request</h3>
                <div className="bg-muted rounded-lg p-4 relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(webhookExample, 'webhook')}
                  >
                    {copiedKey === 'webhook' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <pre className="text-xs overflow-x-auto">
                    <code>{webhookExample}</code>
                  </pre>
                </div>
              </div>

              <Alert variant="destructive">
                <Key className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  All webhook requests must include your service role key in the Authorization header.
                  Store this securely in your CI/CD platform's secrets management.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Full Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For detailed setup instructions, troubleshooting, and best practices, see the complete CI/CD integration guide.
          </p>
          <Button variant="outline" asChild>
            <a href="/CI_CD_SECURITY_SETUP.md" target="_blank">
              <Settings className="h-4 w-4 mr-2" />
              View Complete Setup Guide
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default CICDSetup