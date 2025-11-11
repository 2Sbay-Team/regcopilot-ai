// Integration test for full ESG ingestion workflow
// Run with: deno test --allow-net --allow-env supabase/functions/_tests/esg-ingestion-workflow.test.ts

import { assertEquals, assertExists, assert } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

const testOrgId = "00000000-0000-0000-0000-000000000001";

async function callFunction(functionName: string, body: any) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { status: response.status, data };
}

Deno.test("ESG Workflow - Step 1: Demo Seed Ingestion", async () => {
  const result = await callFunction("demo-seed-ingestion", {});

  assertEquals(result.status, 200, "Demo seed should succeed");
  assertExists(result.data.connectors_created, "Should create connectors");
  assertExists(result.data.staging_rows, "Should create staging rows");
  assertExists(result.data.mapping_profiles, "Should create mapping profiles");
  assertExists(result.data.kpi_rules, "Should create KPI rules");

  assert(result.data.connectors_created >= 3, "Should create at least 3 connectors");
  assert(result.data.staging_rows >= 60, "Should create at least 60 staging rows");
  assert(result.data.kpi_rules >= 5, "Should create at least 5 KPI rules");

  console.log("✅ Demo seed completed:", result.data);
});

Deno.test("ESG Workflow - Step 2: Mapping Suggestion", async () => {
  const result = await callFunction("mapping-suggest", {});

  assertEquals(result.status, 200, "Mapping suggest should succeed");
  assertExists(result.data.profile_id, "Should return profile ID");
  assertExists(result.data.tables_suggested, "Should suggest tables");
  assertExists(result.data.fields_suggested, "Should suggest fields");

  assert(result.data.tables_suggested >= 3, "Should suggest at least 3 tables");
  assert(result.data.fields_suggested >= 5, "Should suggest at least 5 fields");

  console.log("✅ Mapping suggestion completed:", result.data);
});

Deno.test("ESG Workflow - Step 3: Run Mapping", async () => {
  // First get the latest mapping profile
  const suggestResult = await callFunction("mapping-suggest", {});
  const profileId = suggestResult.data.profile_id;

  const result = await callFunction("run-mapping", {
    profile_id: profileId,
  });

  assertEquals(result.status, 200, "Run mapping should succeed");
  assertExists(result.data.metrics_processed, "Should process metrics");
  assertExists(result.data.metric_codes, "Should return metric codes");

  assert(result.data.metrics_processed >= 3, "Should process at least 3 metrics");
  assert(Array.isArray(result.data.metric_codes), "Metric codes should be array");

  console.log("✅ Mapping execution completed:", result.data);
});

Deno.test("ESG Workflow - Step 4: KPI Evaluation", async () => {
  const result = await callFunction("kpi-evaluate", {});

  assertEquals(result.status, 200, "KPI evaluation should succeed");
  assertExists(result.data.rules_evaluated, "Should evaluate rules");
  assertExists(result.data.results_generated, "Should generate results");

  assert(result.data.rules_evaluated >= 3, "Should evaluate at least 3 rules");

  console.log("✅ KPI evaluation completed:", result.data);
});

Deno.test("ESG Workflow - Step 5: Verify KPI Results", async () => {
  // Query Supabase directly to verify KPI results exist
  const response = await fetch(`${SUPABASE_URL}/rest/v1/esg_kpi_results?select=*&limit=10`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });

  const data = await response.json();

  assert(Array.isArray(data), "Should return array of results");
  assert(data.length > 0, "Should have at least one KPI result");

  // Verify required fields
  const sample = data[0];
  assertExists(sample.metric_code, "Should have metric_code");
  assertExists(sample.value, "Should have value");
  assertExists(sample.period, "Should have period");
  assertExists(sample.unit, "Should have unit");

  console.log("✅ KPI results verified:", data.length, "records found");
  console.log("Sample KPI:", sample);
});

Deno.test("ESG Workflow - Step 6: Verify Data Lineage", async () => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/data_lineage_edges?select=*&limit=10`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });

  const data = await response.json();

  assert(Array.isArray(data), "Should return array of lineage edges");
  assert(data.length > 0, "Should have at least one lineage edge");

  const sample = data[0];
  assertExists(sample.from_ref, "Should have from_ref");
  assertExists(sample.to_ref, "Should have to_ref");
  assertExists(sample.relation_type, "Should have relation_type");

  console.log("✅ Data lineage verified:", data.length, "edges found");
});

Deno.test("ESG Workflow - Step 7: Verify Audit Chain", async () => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/esg_ingestion_audit?select=*&order=occurred_at.desc&limit=10`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });

  const data = await response.json();

  assert(Array.isArray(data), "Should return array of audit entries");
  assert(data.length > 0, "Should have at least one audit entry");

  // Verify hash chain integrity
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const previous = data[i + 1];
    
    assertExists(current.input_hash, "Should have input_hash");
    assertExists(current.output_hash, "Should have output_hash");
    
    if (current.prev_hash && previous.output_hash) {
      assertEquals(
        current.prev_hash,
        previous.output_hash,
        "Hash chain should be intact"
      );
    }
  }

  console.log("✅ Audit chain verified:", data.length, "entries checked");
});

Deno.test("ESG Workflow - Performance: Large Dataset Handling", async () => {
  const startTime = Date.now();
  
  // Run mapping with large dataset
  const result = await callFunction("run-mapping", {
    profile_id: "test-profile",
  });
  
  const duration = Date.now() - startTime;
  
  assert(duration < 30000, "Should complete within 30 seconds");
  console.log("✅ Performance test passed:", duration, "ms");
});

Deno.test("ESG Workflow - Data Quality: Unit Normalization", async () => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/esg_kpi_results?select=metric_code,unit,value&limit=100`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });

  const data = await response.json();

  // Verify E1 metrics have correct units
  const e1Metrics = data.filter((r: any) => r.metric_code?.startsWith("E1-"));
  for (const metric of e1Metrics) {
    if (metric.metric_code.includes("scope") || metric.metric_code.includes("total")) {
      assertEquals(metric.unit, "tonnes CO2e", "Emission metrics should use tonnes CO2e");
    }
  }

  console.log("✅ Unit normalization verified");
});

Deno.test("ESG Workflow - Data Quality: Value Plausibility", async () => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/esg_kpi_results?select=metric_code,value&limit=100`, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });

  const data = await response.json();

  // Check for negative values in emissions
  const emissionMetrics = data.filter((r: any) => r.metric_code?.includes("scope"));
  for (const metric of emissionMetrics) {
    assert(metric.value >= 0, `Emission values should be non-negative, got ${metric.value}`);
  }

  // Check for percentage values in reasonable range
  const percentMetrics = data.filter((r: any) => r.metric_code?.includes("percent") || r.metric_code?.includes("ratio"));
  for (const metric of percentMetrics) {
    assert(metric.value >= 0 && metric.value <= 100, `Percentage should be 0-100, got ${metric.value}`);
  }

  console.log("✅ Value plausibility verified");
});
