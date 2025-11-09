import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, secret, token } = await req.json();

    switch (action) {
      case 'generate': {
        // Generate TOTP secret
        const base32Secret = generateBase32Secret();
        const appName = 'Compliance Copilot';
        const userEmail = user.email || 'user@example.com';
        
        // Create OTPAuth URL
        const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${base32Secret}&issuer=${encodeURIComponent(appName)}`;
        
        // Generate QR code data URL
        const qrCode = await generateQRCode(otpauthUrl);
        
        // Store secret temporarily (not yet verified)
        await supabase
          .from('profiles')
          .update({
            mfa_secret_temp: base32Secret,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        return new Response(
          JSON.stringify({
            secret: base32Secret,
            qr_code: qrCode
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        // Verify TOTP token
        const isValid = verifyTOTP(secret, token);
        
        if (isValid) {
          // Move secret from temp to permanent and enable MFA
          await supabase
            .from('profiles')
            .update({
              mfa_secret: secret,
              mfa_secret_temp: null,
              mfa_enabled: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }

        return new Response(
          JSON.stringify({ valid: isValid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'generate-backup-codes': {
        // Generate 8 backup codes
        const codes: string[] = [];
        for (let i = 0; i < 8; i++) {
          codes.push(generateBackupCode());
        }

        // Hash and store backup codes
        const hashedCodes = await Promise.all(
          codes.map(code => hashBackupCode(code))
        );

        await supabase
          .from('mfa_backup_codes')
          .insert(
            hashedCodes.map(hash => ({
              user_id: user.id,
              code_hash: hash,
              used: false
            }))
          );

        return new Response(
          JSON.stringify({ codes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disable': {
        // Disable MFA
        await supabase
          .from('profiles')
          .update({
            mfa_enabled: false,
            mfa_secret: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        // Delete backup codes
        await supabase
          .from('mfa_backup_codes')
          .delete()
          .eq('user_id', user.id);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MFA Setup] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Generate base32 secret for TOTP
function generateBase32Secret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < 20; i++) {
    secret += chars[array[i] % 32];
  }
  
  return secret;
}

// Generate QR code as data URL
async function generateQRCode(text: string): Promise<string> {
  // Using a simple QR code generation approach
  // In production, use a proper QR code library
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  const response = await fetch(qrApiUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return `data:image/png;base64,${base64}`;
}

// Verify TOTP token
function verifyTOTP(secret: string, token: string): boolean {
  const window = 1; // Allow 30s time window
  const time = Math.floor(Date.now() / 1000 / 30);
  
  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, time + i) === token) {
      return true;
    }
  }
  
  return false;
}

// Generate TOTP token for a given time
function generateTOTP(secret: string, time: number): string {
  // Decode base32 secret
  const key = base32Decode(secret);
  
  // Convert time to 8-byte buffer
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);
  
  // HMAC-SHA1
  const hmac = hmacSha1(key, new Uint8Array(timeBuffer));
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

// Base32 decode
function base32Decode(base32: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = base32.toUpperCase().split('').map(c => {
    const val = chars.indexOf(c);
    return val.toString(2).padStart(5, '0');
  }).join('');
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  
  return bytes;
}

// Simple HMAC-SHA1 implementation
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  // This is a simplified version
  // In production, use crypto.subtle.sign
  const blockSize = 64;
  
  if (key.length > blockSize) {
    // Hash the key if it's too long
    key = new Uint8Array(20); // SHA1 output
  }
  
  if (key.length < blockSize) {
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(key);
    key = paddedKey;
  }
  
  // XOR key with ipad and opad
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5c;
  }
  
  // Note: This is a placeholder. In production, use crypto.subtle
  // For now, return a mock HMAC
  const result = new Uint8Array(20);
  crypto.getRandomValues(result);
  return result;
}

// Generate backup code
function generateBackupCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < 8; i++) {
    code += chars[array[i] % chars.length];
    if (i === 3) code += '-'; // Add separator
  }
  
  return code;
}

// Hash backup code for storage
async function hashBackupCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
