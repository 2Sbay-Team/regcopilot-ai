// Integration test for ESG Reporter Edge Function
// Run with: deno test --allow-net --allow-env

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get("SUPABASE_URL") + "/functions/v1/esg-reporter";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.test("ESG Reporter - Valid Metrics", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      metrics: {
        carbon_emissions: 1000,
        energy_usage: 500,
        water_usage: 200,
        waste_generated: 50,
        employees_total: 100,
        employees_female: 45,
        training_hours: 2000,
      },
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.narrative);
  assertExists(data.completeness);
  assertExists(data.report_id);
});

Deno.test("ESG Reporter - Incomplete Metrics Warning", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      metrics: {
        carbon_emissions: 1000,
        // Missing other metrics
      },
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.completeness);
  assertEquals(data.completeness < 1.0, true, "Completeness should be less than 100%");
});

Deno.test("ESG Reporter - RAG Context Retrieval", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      organization_id: "00000000-0000-0000-0000-000000000001",
      metrics: {
        carbon_emissions: 5000,
        energy_usage: 3000,
      },
    }),
  });

  const data = await response.json();
  assertExists(data.citations);
  assertEquals(Array.isArray(data.citations), true);
});
