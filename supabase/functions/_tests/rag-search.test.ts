// Integration test for RAG Search Edge Function
// Run with: deno test --allow-net --allow-env

import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const FUNCTION_URL = Deno.env.get("SUPABASE_URL") + "/functions/v1/rag-search";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.test("RAG Search - Valid Query", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      query: "What are the requirements for high-risk AI systems?",
      top_k: 5,
      threshold: 0.7,
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.results);
  assertEquals(Array.isArray(data.results), true);
  assertEquals(data.results.length <= 5, true);
});

Deno.test("RAG Search - Similarity Threshold", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      query: "AI Act requirements",
      top_k: 10,
      threshold: 0.85, // High threshold
    }),
  });

  const data = await response.json();
  
  // All results should have similarity >= 0.85
  data.results.forEach((result: any) => {
    assertEquals(result.similarity >= 0.85, true);
  });
});

Deno.test("RAG Search - Empty Results", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      query: "completely unrelated gibberish query xyz123",
      top_k: 5,
      threshold: 0.95, // Very high threshold
    }),
  });

  const data = await response.json();
  assertEquals(data.results.length, 0);
});

Deno.test("RAG Search - Metadata Filtering", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      query: "GDPR data protection",
      top_k: 5,
      filter: {
        source: "GDPR",
      },
    }),
  });

  const data = await response.json();
  
  // All results should be from GDPR source
  data.results.forEach((result: any) => {
    assertEquals(result.source, "GDPR");
  });
});
