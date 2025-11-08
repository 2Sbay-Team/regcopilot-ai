import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Edge function to seed regulatory documents into the vector database
 * This would typically be called once or periodically to update the knowledge base
 */

interface RegulationChunk {
  document_type: string
  section: string
  content: string
  source: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting regulatory document seeding...')

    // Generate unique session ID for this seeding operation
    const sessionId = crypto.randomUUID()

    // Helper function to update progress
    const updateProgress = async (status: string, currentStep: string, processedChunks: number, totalChunks: number) => {
      const progressPercentage = totalChunks > 0 ? (processedChunks / totalChunks) * 100 : 0
      await supabase
        .from('seeding_progress')
        .upsert({
          session_id: sessionId,
          status,
          current_step: currentStep,
          total_chunks: totalChunks,
          processed_chunks: processedChunks,
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' })
    }

    // Sample EU AI Act chunks
    const aiActChunks: RegulationChunk[] = [
      {
        document_type: 'EU AI Act',
        section: 'Article 5 - Prohibited Practices',
        content: 'AI systems that deploy subliminal techniques or manipulate persons in ways that cause physical or psychological harm shall be prohibited. This includes systems that exploit vulnerabilities of specific groups.',
        source: 'EU AI Act 2024'
      },
      {
        document_type: 'EU AI Act',
        section: 'Article 6 - High-Risk AI Systems',
        content: 'AI systems used in employment, workers management, and access to self-employment, particularly for recruitment and selection of persons, are classified as high-risk. These require conformity assessment before deployment.',
        source: 'EU AI Act 2024'
      },
      {
        document_type: 'EU AI Act',
        section: 'Annex III - High-Risk Use Cases',
        content: 'High-risk AI systems include: biometric identification, critical infrastructure management, educational/vocational training scoring, employment decisions, essential private/public services access, law enforcement systems, migration/asylum/border control, and justice administration.',
        source: 'EU AI Act 2024 Annex III'
      },
      {
        document_type: 'EU AI Act',
        section: 'Article 13 - Transparency',
        content: 'High-risk AI systems shall be designed to operate with sufficient transparency to enable users to interpret the system output and use it appropriately. Information on the system capabilities and limitations shall be provided.',
        source: 'EU AI Act 2024'
      }
    ]

    // Sample GDPR chunks
    const gdprChunks: RegulationChunk[] = [
      {
        document_type: 'GDPR',
        section: 'Article 5 - Principles',
        content: 'Personal data shall be processed lawfully, fairly and transparently; collected for specified, explicit and legitimate purposes; adequate, relevant and limited to what is necessary; accurate and kept up to date; kept in a form which permits identification for no longer than necessary.',
        source: 'GDPR 2016/679'
      },
      {
        document_type: 'GDPR',
        section: 'Article 6 - Lawfulness of Processing',
        content: 'Processing of personal data shall be lawful only if: the data subject has given consent; processing is necessary for contract performance; necessary for legal obligation; necessary to protect vital interests; necessary for public interest task; or necessary for legitimate interests.',
        source: 'GDPR 2016/679'
      },
      {
        document_type: 'GDPR',
        section: 'Chapter V - Transfers',
        content: 'Transfer of personal data to third countries or international organisations requires adequacy decision or appropriate safeguards such as Standard Contractual Clauses (SCCs), Binding Corporate Rules, or certification mechanisms.',
        source: 'GDPR 2016/679 Chapter V'
      }
    ]

    // Sample CSRD/ESRS chunks
    const esrsChunks: RegulationChunk[] = [
      {
        document_type: 'ESRS',
        section: 'ESRS E1 - Climate Change',
        content: 'Organizations must disclose GHG emissions across Scope 1 (direct), Scope 2 (indirect from electricity), and Scope 3 (value chain). Emissions must be reported in metric tons of CO2 equivalent using GHG Protocol standards.',
        source: 'ESRS E1 Climate Change'
      },
      {
        document_type: 'ESRS',
        section: 'ESRS E1 - Targets',
        content: 'Climate-related targets shall include GHG emission reduction targets, with baseline year, target year, milestones, and whether targets are absolute or intensity-based. Paris Agreement alignment should be demonstrated.',
        source: 'ESRS E1 Climate Change'
      },
      {
        document_type: 'ESRS',
        section: 'ESRS S1 - Own Workforce',
        content: 'Reporting on own workforce includes diversity metrics (gender, age, disability), working conditions, equal opportunities, collective bargaining coverage, and training hours per employee category.',
        source: 'ESRS S1 Own Workforce'
      }
    ]

    const allChunks = [...aiActChunks, ...gdprChunks, ...esrsChunks]
    const totalChunks = allChunks.length

    // Initialize progress
    await updateProgress('in_progress', 'Preparing chunks...', 0, totalChunks)

    // Insert chunks with placeholder embeddings
    const chunksToInsert = allChunks.map((chunk, index) => ({
      document_id: null,
      chunk_index: index,
      content: chunk.content,
      embedding: new Array(1536).fill(0).map(() => Math.random() * 0.01), // Placeholder embedding
      metadata: {
        document_type: chunk.document_type,
        section: chunk.section,
        source: chunk.source
      }
    }))

    // Update progress - processing chunks
    await updateProgress('in_progress', 'Inserting regulatory documents...', 0, totalChunks)

    // Insert in batches for better progress tracking
    const batchSize = 3
    let processedCount = 0

    for (let i = 0; i < chunksToInsert.length; i += batchSize) {
      const batch = chunksToInsert.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('document_chunks')
        .insert(batch)
        .select()

      if (error) {
        console.error('Seeding error:', error)
        await updateProgress('failed', `Error: ${error.message}`, processedCount, totalChunks)
        throw error
      }

      processedCount += batch.length
      const currentDoc = batch[0].metadata.document_type
      await updateProgress('in_progress', `Processing ${currentDoc}...`, processedCount, totalChunks)
      
      // Small delay to make progress visible
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Final progress update
    await updateProgress('completed', 'Knowledge base initialized!', totalChunks, totalChunks)

    console.log(`Successfully seeded ${allChunks.length} regulatory chunks`)

    return new Response(
      JSON.stringify({
        success: true,
        chunks_seeded: totalChunks,
        session_id: sessionId,
        message: 'Regulatory knowledge base seeded successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Seed regulations error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
