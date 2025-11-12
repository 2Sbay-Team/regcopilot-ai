const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: "Design a circular Azure-blue logo for LaterneX on a white background. Symbolize: EU AI Act, GDPR, ESG, Ethics, and Data Ingestion. Use four subtle sectors orbiting a glowing center 'L', with fine network lines and a dashed ingestion arc. Minimalist, vector, professional."
          }
        ],
        modalities: ["image", "text"]
      })
    })

    const data = await response.json()
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating logo:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
