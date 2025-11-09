import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowRight, BookOpen, FileText, PlayCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  title: string
  description: string
  category: string
  type: "page" | "faq" | "guide" | "video"
  route?: string
  icon: typeof BookOpen
}

const searchableContent: SearchResult[] = [
  // Pages
  { title: "Dashboard", description: "View compliance overview and key metrics", category: "Pages", type: "page", route: "/dashboard", icon: FileText },
  { title: "AI Act Auditor", description: "Assess AI systems for EU AI Act compliance", category: "Pages", type: "page", route: "/ai-act", icon: FileText },
  { title: "GDPR Checker", description: "Privacy compliance and DSAR management", category: "Pages", type: "page", route: "/gdpr", icon: FileText },
  { title: "ESG Reporter", description: "Sustainability reporting and CSRD compliance", category: "Pages", type: "page", route: "/esg", icon: FileText },
  { title: "Model Registry", description: "Register and track AI models", category: "Pages", type: "page", route: "/model-registry", icon: FileText },
  { title: "Connectors", description: "Connect external data sources", category: "Pages", type: "page", route: "/connectors", icon: FileText },
  { title: "DSAR Management", description: "Handle data subject access requests", category: "Pages", type: "page", route: "/dsar", icon: FileText },
  { title: "Audit Trail", description: "View compliance activity logs", category: "Pages", type: "page", route: "/audit", icon: FileText },
  { title: "Scheduled Jobs", description: "Automate compliance workflows", category: "Pages", type: "page", route: "/scheduled-jobs", icon: FileText },
  { title: "Help Center", description: "FAQs, guides, and video tutorials", category: "Pages", type: "page", route: "/help-center", icon: FileText },
  
  // FAQs
  { title: "What is Regulix?", description: "Platform overview and capabilities", category: "FAQs", type: "faq", route: "/help-center", icon: BookOpen },
  { title: "How to classify AI risk?", description: "EU AI Act risk assessment guide", category: "FAQs", type: "faq", route: "/help-center", icon: BookOpen },
  { title: "DSAR handling guide", description: "Fulfill data subject access requests", category: "FAQs", type: "faq", route: "/help-center", icon: BookOpen },
  { title: "ESG metrics tracking", description: "Which metrics to track for CSRD", category: "FAQs", type: "faq", route: "/help-center", icon: BookOpen },
  { title: "Connector setup", description: "Connect AWS, SharePoint, SAP and more", category: "FAQs", type: "faq", route: "/help-center", icon: BookOpen },
  
  // Guides
  { title: "5-Minute Quickstart", description: "Get started with your first assessment", category: "Guides", type: "guide", route: "/help-center", icon: BookOpen },
  { title: "Setting Up Connectors", description: "Connect data sources for automation", category: "Guides", type: "guide", route: "/help-center", icon: BookOpen },
  { title: "DSAR Workflow", description: "Complete DSAR handling process", category: "Guides", type: "guide", route: "/help-center", icon: BookOpen },
  { title: "Model Registry Setup", description: "Track AI models for compliance", category: "Guides", type: "guide", route: "/help-center", icon: BookOpen },
  
  // Videos
  { title: "Platform Overview Video", description: "Complete feature walkthrough (15:30)", category: "Videos", type: "video", route: "/help-center", icon: PlayCircle },
  { title: "AI Act Compliance Video", description: "Risk assessment tutorial (12:45)", category: "Videos", type: "video", route: "/help-center", icon: PlayCircle },
  { title: "GDPR Automation Video", description: "Automate DSAR handling (10:20)", category: "Videos", type: "video", route: "/help-center", icon: PlayCircle },
  { title: "ESG Reporting Video", description: "Create CSRD reports (8:15)", category: "Videos", type: "video", route: "/help-center", icon: PlayCircle },
]

export function GlobalHelpSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Search logic
  useEffect(() => {
    if (!query) {
      setResults(searchableContent.slice(0, 8))
      return
    }

    const filtered = searchableContent.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered.slice(0, 8))
    setSelectedIndex(0)
  }, [query])

  // Handle arrow navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }, [results, selectedIndex])

  const handleSelect = (result: SearchResult) => {
    if (result.route) {
      navigate(result.route)
    }
    setIsOpen(false)
    setQuery("")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page": return "bg-blue-500/10 text-blue-500"
      case "faq": return "bg-green-500/10 text-green-500"
      case "guide": return "bg-purple-500/10 text-purple-500"
      case "video": return "bg-orange-500/10 text-orange-500"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base font-normal flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help, guides, and features..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 shadow-none focus-visible:ring-0 px-0 h-8 text-base"
              autoFocus
            />
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = result.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(result)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors ${
                      index === selectedIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-md ${getTypeColor(result.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{result.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No results found</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded border text-xs">↑</kbd>
              <kbd className="px-2 py-1 bg-muted rounded border text-xs">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded border text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded border text-xs">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
