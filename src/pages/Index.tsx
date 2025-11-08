import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileCheck, Leaf, Lock, Database, Zap } from "lucide-react"
import { useEffect } from "react"

const Index = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Shield className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">RegTech Copilot</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered compliance for EU AI Act, GDPR & ESG reporting. 
            Your complete regulatory technology solution.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/signup")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Act Compliance</CardTitle>
              <CardDescription>
                Classify AI systems, assess risk levels, and generate Annex IV documentation automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>GDPR Checker</CardTitle>
              <CardDescription>
                Scan for personal data, identify compliance gaps, and manage DSAR requests efficiently
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Leaf className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ESG Reporting</CardTitle>
              <CardDescription>
                Generate CSRD/ESRS sustainability reports with AI-powered insights and metrics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Enterprise-Grade Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <Database className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">RAG-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Vector database with regulatory knowledge for accurate compliance guidance
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Lock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Audit Trail</h3>
              <p className="text-muted-foreground">
                Hash-chained audit logs ensure complete transparency and accountability
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Copilots</h3>
              <p className="text-muted-foreground">
                Multiple specialized agents for different compliance domains
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to automate your compliance?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join organizations using RegTech Copilot for smarter regulatory management
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
