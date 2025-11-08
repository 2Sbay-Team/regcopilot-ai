import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Search, ArrowLeft, BookOpen, Loader2, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const RAGSearch = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke("rag-search", {
        body: { query, top_k: 5 },
      })

      if (error) throw error

      setResults(data.results || [])
      
      if (data.fallback) {
        toast({
          title: "Using Text Search",
          description: "Vector search unavailable, using text-based fallback",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const seedKnowledge = async () => {
    setSeeding(true)
    try {
      const { data, error } = await supabase.functions.invoke("seed-regulations", {})

      if (error) throw error

      toast({
        title: "Knowledge Base Seeded",
        description: `Successfully added ${data.chunks_seeded} regulatory chunks`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: error.message,
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Regulatory Knowledge Search</h1>
              <p className="text-sm text-muted-foreground">RAG-powered compliance research</p>
            </div>
          </div>
          <Button variant="outline" onClick={seedKnowledge} disabled={seeding}>
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Seed Knowledge Base
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Regulatory Documents</CardTitle>
            <CardDescription>
              Search across EU AI Act, GDPR, and CSRD/ESRS regulations using AI-powered semantic search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., high-risk AI systems in employment"
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results.length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
              Found {results.length} relevant results
            </div>
          )}
          
          {results.map((result, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{result.source || 'Regulation'}</CardTitle>
                    <CardDescription>{result.section || 'N/A'}</CardDescription>
                  </div>
                  {result.similarity && (
                    <Badge variant="secondary">
                      {(result.similarity * 100).toFixed(0)}% match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{result.content}</p>
              </CardContent>
            </Card>
          ))}

          {!loading && results.length === 0 && query && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No results found. Try a different search term.</p>
              </CardContent>
            </Card>
          )}

          {!loading && !query && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Enter a search query to find relevant regulatory information</p>
                <p className="text-xs mt-2">Powered by vector similarity search with pgvector</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default RAGSearch
