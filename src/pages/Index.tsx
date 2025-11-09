import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo"
import { Shield, FileCheck, Leaf, Lock, Database, Zap, Twitter, Linkedin, Github, Mail } from "lucide-react"
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
          <div className="inline-flex p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl mb-6 hover:shadow-2xl transition-all duration-300">
            <RoboticShieldLogo size={96} />
          </div>
          <h1 className="text-5xl font-bold mb-2 animate-in">Regulix™</h1>
          <p className="text-lg text-primary font-medium mb-4 animate-in" style={{ animationDelay: "0.1s" }}>Modern Regulatory Intelligence</p>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in" style={{ animationDelay: "0.2s" }}>
            AI-powered compliance for EU AI Act, GDPR & ESG reporting. 
            Adaptive multi-tasking intelligence for modern regulatory challenges.
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
          <Card className="cockpit-panel">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Act Compliance</CardTitle>
              <CardDescription>
                Classify AI systems, assess risk levels, and generate Annex IV documentation automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cockpit-panel">
            <CardHeader>
              <FileCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>GDPR Checker</CardTitle>
              <CardDescription>
                Scan for personal data, identify compliance gaps, and manage DSAR requests efficiently
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cockpit-panel">
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
            <h2 className="text-3xl font-bold mb-4">Ready for modern regulatory intelligence?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join organizations using Regulix™ for adaptive compliance solutions
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/signup")}>
              Start Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-lg block leading-tight">Regulix™</span>
                  <span className="text-xs text-muted-foreground">Regulatory Intelligence</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered compliance solutions for modern enterprises. Modern regulatory intelligence with adaptive multi-tasking.
              </p>
              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="mailto:hello@regulix.ai" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    AI Act Compliance
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    GDPR Checker
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    ESG Reporting
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    Audit Trail
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    Careers
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/privacy-policy")} className="hover:text-primary transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-primary transition-colors">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/security-privacy")} className="hover:text-primary transition-colors">
                    Security & Data Protection
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Regulix™. All rights reserved. Modern regulatory intelligence with adaptive multi-tasking.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index
