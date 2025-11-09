import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

interface PasswordCheckRequest {
  password: string
  user_id?: string // Optional: for logging
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

    const { password, user_id }: PasswordCheckRequest = await req.json()

    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Password must be at least 8 characters' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Hash password using SHA-1 (as per HaveIBeenPwned API)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const hashUpper = hashHex.toUpperCase()

    // Split hash: first 5 chars for API, rest for matching
    const hashPrefix = hashUpper.substring(0, 5)
    const hashSuffix = hashUpper.substring(5)

    console.log('Checking password hash prefix:', hashPrefix)

    // Query HaveIBeenPwned API (k-anonymity model)
    const pwndResponse = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
      headers: {
        'User-Agent': 'Compliance-ESG-Copilot',
        'Add-Padding': 'true' // Prevents hash prefix inference
      }
    })

    if (!pwndResponse.ok) {
      console.error('HaveIBeenPwned API error:', pwndResponse.status)
      return new Response(
        JSON.stringify({
          success: true,
          is_leaked: false,
          warning: 'Unable to check password leak database'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const pwndText = await pwndResponse.text()
    const hashes = pwndText.split('\n')
    
    let isLeaked = false
    let breachCount = 0

    for (const line of hashes) {
      const [suffix, count] = line.split(':')
      if (suffix.trim() === hashSuffix) {
        isLeaked = true
        breachCount = parseInt(count.trim(), 10)
        break
      }
    }

    // Log the check result if user_id provided
    if (user_id) {
      await supabase.from('password_leak_checks').insert({
        user_id,
        is_leaked: isLeaked,
        hash_prefix: hashPrefix,
        metadata: {
          breach_count: breachCount,
          checked_at: new Date().toISOString()
        }
      })
    }

    console.log(`Password check result: ${isLeaked ? 'LEAKED' : 'SAFE'}`)

    return new Response(
      JSON.stringify({
        success: true,
        is_leaked: isLeaked,
        breach_count: breachCount,
        message: isLeaked 
          ? `This password has been seen in ${breachCount} data breaches. Choose a different password.`
          : 'Password is not found in known breaches.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Password leak check error:', error)
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
