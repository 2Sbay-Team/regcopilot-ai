// Integration test for GDPR Checker Edge Function
// Run with: deno test --allow-net --allow-env

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get("SUPABASE_URL") + "/functions/v1/gdpr-checker";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.test("GDPR Checker - Text Input", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      text_input: "Contact: John Doe, email: john@example.com, phone: +1-555-0123",
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.violations);
  assertExists(data.summary);
  assertExists(data.pii_detected);
});

Deno.test("GDPR Checker - No PII Detected", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      text_input: "This is a test document with no personal information.",
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertEquals(data.pii_detected.length, 0);
});

Deno.test("GDPR Checker - PII Detection Patterns", async () => {
  const testCases = [
    { input: "Email: test@example.com", expectedPII: ["email"] },
    { input: "Phone: +1-555-0123", expectedPII: ["phone"] },
    { input: "SSN: 123-45-6789", expectedPII: ["ssn"] },
    { input: "IP: 192.168.1.1", expectedPII: ["ip_address"] },
  ];

  for (const testCase of testCases) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        organization_id: "00000000-0000-0000-0000-000000000001",
        text_input: testCase.input,
      }),
    });

    const data = await response.json();
    for (const piiType of testCase.expectedPII) {
      assertEquals(data.pii_detected.includes(piiType), true,
        `Should detect ${piiType} in "${testCase.input}"`);
    }
  }
});
