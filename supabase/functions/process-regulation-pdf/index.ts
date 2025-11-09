import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  file_path: string;
  regulation_type: string;
  version: string;
  organization_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roleCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { file_path, regulation_type, version, organization_id }: ProcessRequest = await req.json();

    console.log(`Processing regulation: ${regulation_type} v${version}`);

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('regulatory-documents')
      .download(file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert blob to base64 for document parsing
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Parse PDF using Lovable's document parsing
    console.log('Parsing PDF document...');
    const parseResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/parse-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_data: base64,
        file_name: file_path.split('/').pop(),
      }),
    });

    if (!parseResponse.ok) {
      throw new Error('Failed to parse PDF');
    }

    const { text } = await parseResponse.json();
    
    // Chunk the text intelligently by articles/sections
    const chunks = intelligentChunk(text, regulation_type);
    console.log(`Created ${chunks.length} chunks`);

    // Generate embeddings and store chunks
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let successCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate embedding using Lovable AI
        const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: chunk.content,
            model: 'text-embedding-3-large',
          }),
        });

        if (!embeddingResponse.ok) {
          console.error(`Failed to generate embedding for chunk ${i}`);
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Store chunk in document_chunks
        const { error: insertError } = await supabaseClient
          .from('document_chunks')
          .insert({
            content: chunk.content,
            chunk_index: i,
            embedding: embedding,
            metadata: {
              source: regulation_type,
              version: version,
              section: chunk.section,
              article: chunk.article,
              uploaded_by: user.id,
              uploaded_at: new Date().toISOString(),
            },
          });

        if (!insertError) {
          successCount++;
        } else {
          console.error(`Failed to insert chunk ${i}:`, insertError);
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
      }
    }

    // Update regulation version status
    await supabaseClient
      .from('regulation_versions')
      .update({
        status: successCount > 0 ? 'active' : 'failed',
        chunks_count: successCount,
        metadata: { 
          total_chunks: chunks.length, 
          successful_chunks: successCount 
        },
      })
      .eq('file_path', file_path);

    return new Response(
      JSON.stringify({
        success: true,
        chunks_created: successCount,
        total_chunks: chunks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing regulation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Intelligent chunking based on regulation structure
function intelligentChunk(text: string, regulationType: string): Array<{ content: string; section: string; article: string }> {
  const chunks: Array<{ content: string; section: string; article: string }> = [];
  
  // Split by articles/sections based on regulation type
  const articlePattern = /Article\s+(\d+[a-z]?)\s*[-–—]\s*([^\n]+)/gi;
  const sections = text.split(articlePattern);
  
  let currentArticle = 'Preamble';
  let currentTitle = '';
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]?.trim();
    
    if (!section || section.length < 50) continue;
    
    // Check if this is an article number
    if (i % 3 === 1) {
      currentArticle = `Article ${section}`;
    } else if (i % 3 === 2) {
      currentTitle = section;
    } else {
      // This is content - chunk it if too large
      const maxChunkSize = 1000;
      if (section.length > maxChunkSize) {
        // Split by paragraphs
        const paragraphs = section.split(/\n\n+/);
        let currentChunk = '';
        
        for (const para of paragraphs) {
          if ((currentChunk + para).length > maxChunkSize && currentChunk) {
            chunks.push({
              content: currentChunk.trim(),
              section: currentTitle || currentArticle,
              article: currentArticle,
            });
            currentChunk = para;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
          }
        }
        
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            section: currentTitle || currentArticle,
            article: currentArticle,
          });
        }
      } else {
        chunks.push({
          content: section,
          section: currentTitle || currentArticle,
          article: currentArticle,
        });
      }
    }
  }
  
  return chunks.filter(c => c.content.length > 50);
}