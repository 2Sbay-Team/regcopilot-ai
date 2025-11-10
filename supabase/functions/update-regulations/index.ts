import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';

const REGULATION_SOURCES = [
  {
    type: 'EU_AI_ACT',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32024R1689',
    name: 'EU AI Act',
  },
  {
    type: 'GDPR',
    url: 'https://gdpr-info.eu/',
    name: 'General Data Protection Regulation',
  },
  {
    type: 'CSRD',
    url: 'https://www.efrag.org/Lab6',
    name: 'Corporate Sustainability Reporting Directive',
  },
  {
    type: 'DORA',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/dora',
    name: 'Digital Operational Resilience Act',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { regulation_type } = await req.json().catch(() => ({}));

    // Filter sources if specific type requested
    const sources = regulation_type
      ? REGULATION_SOURCES.filter(s => s.type === regulation_type)
      : REGULATION_SOURCES;

    const syncResults = [];

    for (const source of sources) {
      const syncLog = {
        regulation_type: source.type,
        source_url: source.url,
        status: 'processing',
        started_at: new Date().toISOString(),
      };

      // Create sync log
      const { data: logEntry, error: logError } = await supabase
        .from('regulation_sync_logs')
        .insert(syncLog)
        .select()
        .single();

      if (logError) {
        console.error('Failed to create sync log:', logError);
        continue;
      }

      try {
        // Fetch regulation content
        console.log(`Fetching ${source.name} from ${source.url}`);
        const response = await fetch(source.url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let content = await response.text();
        const contentType = response.headers.get('content-type') || '';

        // For HTML content, extract text (simple extraction)
        if (contentType.includes('text/html')) {
          content = extractTextFromHTML(content);
        }

        // Generate checksum
        const checksum = await generateChecksum(content);

        // Check if content changed
        const { data: lastSync } = await supabase
          .from('regulation_sync_logs')
          .select('checksum')
          .eq('regulation_type', source.type)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (lastSync && lastSync.checksum === checksum) {
          console.log(`${source.name} unchanged, skipping`);
          await supabase
            .from('regulation_sync_logs')
            .update({
              status: 'skipped',
              completed_at: new Date().toISOString(),
              checksum,
            })
            .eq('id', logEntry.id);

          syncResults.push({ type: source.type, status: 'skipped', reason: 'No changes detected' });
          continue;
        }

        // Chunk the content
        const chunks = intelligentChunk(content, source.type);
        console.log(`Created ${chunks.length} chunks for ${source.name}`);

        // Generate embeddings and insert chunks
        let chunksCreated = 0;
        for (const chunk of chunks) {
          try {
            // Generate embedding
            const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: chunk.content,
                model: 'text-embedding-3-large',
              }),
            });

            if (!embeddingResponse.ok) {
              console.error('Embedding API error:', await embeddingResponse.text());
              continue;
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            // Insert chunk
            await supabase.from('document_chunks').insert({
              content: chunk.content,
              embedding,
              metadata: {
                source: source.name,
                regulation_type: source.type,
                section: chunk.section,
                article: chunk.article,
                synced_at: new Date().toISOString(),
              },
            });

            chunksCreated++;
          } catch (chunkError) {
            console.error(`Failed to process chunk:`, chunkError);
          }
        }

        // Update sync log
        await supabase
          .from('regulation_sync_logs')
          .update({
            status: 'completed',
            checksum,
            chunks_created: chunksCreated,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);

        // Update regulatory_documents table
        await supabase
          .from('regulatory_documents')
          .upsert({
            document_type: source.type.toLowerCase(),
            version: new Date().toISOString().split('T')[0],
            source_url: source.url,
            checksum,
          });

        syncResults.push({
          type: source.type,
          status: 'completed',
          chunks_created: chunksCreated,
        });
      } catch (error) {
        console.error(`Error syncing ${source.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await supabase
          .from('regulation_sync_logs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', logEntry.id);

        syncResults.push({
          type: source.type,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Regulation update error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTextFromHTML(html: string): string {
  // Simple HTML tag removal (in production, use a proper parser)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function intelligentChunk(text: string, regulationType: string): Array<{ content: string; section: string; article: string }> {
  const chunks = [];
  const lines = text.split('\n');
  let currentChunk = '';
  let currentSection = 'Introduction';
  let currentArticle = '';

  // Regex patterns for sections and articles
  const articlePattern = /^Article\s+(\d+)/i;
  const sectionPattern = /^(?:Section|Chapter|Title)\s+(\d+[\w\s]*)/i;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Detect article
    const articleMatch = trimmedLine.match(articlePattern);
    if (articleMatch) {
      if (currentChunk.length > 100) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          article: currentArticle,
        });
        currentChunk = '';
      }
      currentArticle = articleMatch[0];
    }

    // Detect section
    const sectionMatch = trimmedLine.match(sectionPattern);
    if (sectionMatch) {
      if (currentChunk.length > 100) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          article: currentArticle,
        });
        currentChunk = '';
      }
      currentSection = sectionMatch[0];
    }

    currentChunk += line + '\n';

    // Create chunk if it exceeds size limit
    if (currentChunk.length > 2000) {
      chunks.push({
        content: currentChunk.trim(),
        section: currentSection,
        article: currentArticle,
      });
      currentChunk = '';
    }
  }

  // Add remaining content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      section: currentSection,
      article: currentArticle,
    });
  }

  return chunks;
}

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
