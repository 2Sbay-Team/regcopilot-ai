import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScreenshotRequest {
  component: string;
  url?: string;
  annotations?: {
    x: number;
    y: number;
    text: string;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: ScreenshotRequest = await req.json();
    console.log('Generating screenshot for component:', request.component);

    // Note: In a production environment, this would use a headless browser
    // like Puppeteer or Playwright to capture actual screenshots.
    // For now, we'll create placeholder metadata.

    const components = [
      'dashboard',
      'ai-act-copilot',
      'gdpr-copilot',
      'esg-copilot',
      'connectors',
      'audit-trail',
      'reports',
      'settings'
    ];

    if (!components.includes(request.component)) {
      return new Response(
        JSON.stringify({ error: 'Invalid component' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create placeholder screenshot metadata
    const screenshotMetadata = {
      component: request.component,
      generatedAt: new Date().toISOString(),
      annotations: request.annotations || [],
      description: `Screenshot of ${request.component} component`,
      path: `/docs_images/${request.component}.png`
    };

    // In production, this would:
    // 1. Launch headless browser
    // 2. Navigate to component URL
    // 3. Capture screenshot
    // 4. Add annotations
    // 5. Upload to Supabase Storage (docs_images bucket)

    // Log the screenshot generation
    await supabase.from('audit_logs').insert({
      organization_id: user.user_metadata?.organization_id,
      module: 'documentation',
      action: 'generate_screenshot',
      input_hash: request.component,
      reasoning: `Generated screenshot for ${request.component}`
    });

    return new Response(
      JSON.stringify({
        success: true,
        screenshot: screenshotMetadata,
        message: 'Screenshot metadata generated (placeholder mode)'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-screenshots:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
