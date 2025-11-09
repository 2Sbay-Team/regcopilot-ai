// Integration test for AI Act Auditor Edge Function
// Run with: deno test --allow-net --allow-env

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get("SUPABASE_URL") + "/functions/v1/ai-act-auditor";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.test("AI Act Auditor - Valid Request", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      system_name: "Test AI System",
      purpose: "Automated decision-making for credit scoring",
      sector: "financial_services",
      data_sources: ["customer_data", "transaction_history"],
      deployment_status: "production",
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.risk_category);
  assertExists(data.annex_iv_summary);
  assertExists(data.citations);
  assertEquals(data.risk_category, "high"); // Financial services should be high risk
});

Deno.test("AI Act Auditor - Missing Required Fields", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      system_name: "Incomplete System",
      // Missing required fields
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("AI Act Auditor - Unauthorized Request", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // No Authorization header
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      system_name: "Test System",
      purpose: "Test",
      sector: "healthcare",
    }),
  });

  assertEquals(response.status, 401);
});

Deno.test("AI Act Auditor - Risk Classification Logic", async () => {
  const testCases = [
    { sector: "financial_services", expected: "high" },
    { sector: "healthcare", expected: "high" },
    { sector: "law_enforcement", expected: "high" },
    { sector: "education", expected: "limited" },
    { sector: "marketing", expected: "minimal" },
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
        system_name: "Test System",
        purpose: "Testing risk classification",
        sector: testCase.sector,
        data_sources: ["test_data"],
        deployment_status: "production",
      }),
    });

    const data = await response.json();
    assertEquals(data.risk_category, testCase.expected, 
      `Sector ${testCase.sector} should be ${testCase.expected} risk`);
  }
});
