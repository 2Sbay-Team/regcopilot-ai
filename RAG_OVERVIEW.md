# RAG (Retrieval-Augmented Generation) Architecture

## Overview
The Compliance & ESG Copilot uses a vector-based RAG system to provide context-aware responses grounded in regulatory documents (EU AI Act, GDPR, CSRD/ESRS, DMA, DORA, NIS2).

## Current Status
⚠️ **Phase 2 Status**: Using placeholder vectors (random values)  
🎯 **Phase 3 Target**: Real embeddings via OpenAI `text-embedding-3-large` or Gemini `text-embedding-004`

## Architecture

### Data Flow
```
Regulatory Documents
    ↓
Chunking (500-1000 tokens)
    ↓
Embedding Model (text-embedding-3-large)
    ↓
Supabase pgvector storage
    ↓
Semantic Search (cosine similarity)
    ↓
Context Injection into Copilot Prompts
```

### Database Schema

**Table**: `document_chunks`
```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES regulatory_documents(id),
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-large dimension
  metadata JSONB, -- {source, section, article, page_number}
  created_at TIMESTAMP
);
```

**Indexes**:
```sql
-- Vector similarity search (IVFFlat)
CREATE INDEX idx_document_chunks_embedding 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search fallback
CREATE INDEX idx_document_chunks_fts 
ON document_chunks 
USING GIN (to_tsvector('english', content));
```

### Vector Search Function

**Function**: `match_regulatory_chunks`
```sql
CREATE FUNCTION match_regulatory_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  section text,
  source text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata->>'section' as section,
    dc.metadata->>'source' as source,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Embedding Models

### Recommended: OpenAI text-embedding-3-large
- **Dimensions**: 1536
- **Max Tokens**: 8191
- **Cost**: $0.13 per 1M tokens
- **Performance**: Best accuracy for regulatory text

### Alternative: Google Gemini text-embedding-004
- **Dimensions**: 768
- **Max Tokens**: 2048
- **Cost**: Free (via Lovable AI Gateway)
- **Performance**: Good for general use

### Implementation Plan (Phase 3)
```typescript
// supabase/functions/generate-embeddings/index.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 1536
  })
  return response.data[0].embedding
}
```

## Document Chunking Strategy

### Current Seeded Regulations
- **EU AI Act**: 25 chunks (Title I-III, Annexes I-IV)
- **GDPR**: 30 chunks (Articles 1-99)
- **ESRS**: 20 chunks (E1-E5, S1-S4, G1)

### Chunking Rules
1. **Size**: 500-1000 tokens (preserves semantic context)
2. **Overlap**: 100 tokens (prevents context loss at boundaries)
3. **Hierarchy**: Maintain document structure in metadata
4. **Metadata**:
   ```json
   {
     "source": "EU AI Act",
     "section": "Article 6",
     "article_number": "6",
     "title": "Classification rules for high-risk AI systems",
     "page_number": 42,
     "effective_date": "2026-02-02"
   }
   ```

## Search Strategy

### Hybrid Search (Recommended)
1. **Vector Search**: Semantic similarity (primary)
2. **Keyword Search**: Full-text fallback (when vector fails)
3. **Metadata Filtering**: Source-specific queries

### Query Flow
```typescript
// 1. Generate query embedding
const queryEmbedding = await generateEmbedding(userQuery)

// 2. Vector search
let results = await supabase.rpc('match_regulatory_chunks', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 5
})

// 3. Fallback to keyword search if no results
if (!results.data || results.data.length === 0) {
  results = await supabase
    .from('document_chunks')
    .select('*')
    .textSearch('content', userQuery, { type: 'websearch' })
    .limit(5)
}
```

## Integration with Copilots

### Context Injection Pattern
```typescript
// supabase/functions/ai-act-auditor/index.ts
const ragContext = await fetchRAGContext(systemDescription)

const prompt = `
You are an EU AI Act compliance auditor.

REGULATORY CONTEXT:
${ragContext.map(chunk => chunk.content).join('\n\n')}

USER SYSTEM:
${systemDescription}

TASK: Classify the AI system's risk level and cite relevant articles.
`

const response = await callLovableAI(prompt)
```

### Evidence Linking
- Each copilot response includes `evidence_chunks` in `explainability_views`
- Links to specific articles/sections via metadata
- Enables audit trail: "Why did the copilot say this?"

## Performance Optimization

### Query Performance
- **Target Latency**: < 200ms for vector search
- **Index Type**: IVFFlat (good for <100k vectors)
- **For >100k vectors**: Upgrade to HNSW index

### Caching Strategy
- Cache frequent queries (e.g., "What is Article 5 of EU AI Act?")
- TTL: 24 hours (regulations don't change often)
- Cache hit rate: Target >60%

### Batch Processing
- Generate embeddings in batches of 100 chunks
- Parallel processing via edge function workers
- Progress tracking in `seeding_progress` table

## Security & Privacy

### Data Minimization
- **No PII in chunks**: Regulatory text only
- **User queries not stored**: Ephemeral embedding generation
- **Evidence hashing**: Store SHA-256 of chunk, not full text (for audit logs)

### Access Control
- ✅ `document_chunks`: Public read (regulatory documents are public)
- ✅ `explainability_views`: Organization-scoped RLS
- ✅ `regulatory_documents`: Public read

## Maintenance

### Updating Regulations
1. **Quarterly Review**: Check for regulatory updates
2. **Re-embedding**: Run `seed-regulations` edge function
3. **Version Tracking**: Store `effective_date` in metadata
4. **Deprecation**: Archive old chunks, don't delete

### Monitoring
- **Embedding Generation**: Track success rate in `scheduled_jobs`
- **Search Quality**: Log zero-result queries for analysis
- **Index Health**: Monitor query latency via Supabase metrics

## Future Enhancements (Phase 4)

### Multi-Language Support
- Embed in native language (German, French for EU regulations)
- Cross-lingual search via multilingual embedding models

### Custom Document Upload
- Allow organizations to upload their own policies
- Separate namespace per organization
- Hybrid search across regulatory + custom docs

### Fine-Tuned Retrieval
- Train a cross-encoder reranker for regulatory text
- Boost relevance of articles > recitals > annexes

### Agentic RAG
- Multi-hop reasoning: "What does Article 6 say, and how does it relate to Annex III?"
- Dynamic query expansion: Generate sub-queries for complex questions

## Troubleshooting

### Issue: No search results
**Cause**: Query embedding doesn't match any chunks above threshold  
**Fix**: Lower `match_threshold` to 0.5 or use keyword fallback

### Issue: Irrelevant results
**Cause**: Placeholder vectors (random similarity)  
**Fix**: Replace with real embeddings (Phase 3)

### Issue: Slow queries
**Cause**: Missing vector index or too many vectors  
**Fix**: Create IVFFlat index, increase `lists` parameter

## API Usage

### Generate Embeddings (Edge Function)
```bash
curl -X POST https://<project>.supabase.co/functions/v1/generate-embeddings \
  -H "Authorization: Bearer <anon_key>" \
  -d '{"text": "What is a high-risk AI system?"}'
```

### Search Documents (Edge Function)
```bash
curl -X POST https://<project>.supabase.co/functions/v1/rag-search \
  -H "Authorization: Bearer <anon_key>" \
  -d '{"query": "GDPR data subject rights", "top_k": 5}'
```

### Seed Regulations (Admin Only)
```bash
curl -X POST https://<project>.supabase.co/functions/v1/seed-regulations \
  -H "Authorization: Bearer <service_role_key>"
```

## Cost Estimation

### Embedding Generation (One-Time)
- **Total Chunks**: ~75 (EU AI Act, GDPR, ESRS)
- **Avg Tokens per Chunk**: 750
- **Total Tokens**: 56,250
- **Cost (text-embedding-3-large)**: $0.0073

### Ongoing Query Cost
- **Queries per Day**: 1,000 (estimate)
- **Avg Query Tokens**: 50
- **Monthly Tokens**: 1.5M
- **Monthly Cost**: $0.20

## References
- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [EU AI Act Full Text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)
