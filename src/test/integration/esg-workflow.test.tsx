import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('ESG Platform Integration Tests', () => {
  let testOrgId: string;
  let testProfileId: string;

  beforeAll(async () => {
    // Setup test data
    testOrgId = '00000000-0000-0000-0000-000000000001';
  });

  describe('Data Ingestion Pipeline', () => {
    it('should load demo data successfully', async () => {
      const { data, error } = await supabase.functions.invoke('demo-seed-ingestion');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.connectors_created).toBeGreaterThanOrEqual(3);
      expect(data.staging_rows).toBeGreaterThanOrEqual(60);
    });

    it('should have populated staging_rows table', async () => {
      const { data, error } = await supabase
        .from('staging_rows')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should have populated source_schema_cache', async () => {
      const { data, error } = await supabase
        .from('source_schema_cache')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('Mapping & Transformation', () => {
    it('should suggest mapping profile', async () => {
      const { data, error } = await supabase.functions.invoke('mapping-suggest');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.profile_id).toBeDefined();
      expect(data.tables_suggested).toBeGreaterThanOrEqual(3);
      expect(data.fields_suggested).toBeGreaterThanOrEqual(5);

      testProfileId = data.profile_id;
    });

    it('should have created mapping_tables', async () => {
      const { data, error } = await supabase
        .from('mapping_tables')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should have created mapping_fields', async () => {
      const { data, error } = await supabase
        .from('mapping_fields')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should execute mapping successfully', async () => {
      const { data, error } = await supabase.functions.invoke('run-mapping', {
        body: { profile_id: testProfileId },
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.metrics_processed).toBeGreaterThanOrEqual(3);
    });
  });

  describe('KPI Evaluation', () => {
    it('should have active KPI rules', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_rules')
        .select('*')
        .eq('active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThanOrEqual(5);
    });

    it('should evaluate KPIs successfully', async () => {
      const { data, error } = await supabase.functions.invoke('kpi-evaluate');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.rules_evaluated).toBeGreaterThanOrEqual(3);
    });

    it('should have populated esg_kpi_results', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      // Verify required fields
      const sample = data![0];
      expect(sample.metric_code).toBeDefined();
      expect(sample.value).toBeDefined();
      expect(sample.period).toBeDefined();
      expect(sample.unit).toBeDefined();
    });

    it('should have correct metric codes', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('metric_code')
        .limit(100);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const metricCodes = data!.map((r) => r.metric_code);
      const expectedCodes = ['E1-1.scope1', 'E1-1.scope2', 'E1-2.energyTotal', 'S1-1.totalEmployees'];

      for (const code of expectedCodes) {
        expect(metricCodes).toContain(code);
      }
    });
  });

  describe('Data Quality & Validation', () => {
    it('should have non-negative emission values', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('metric_code, value')
        .ilike('metric_code', '%scope%');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      for (const row of data!) {
        expect(row.value).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid units for emissions', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('metric_code, unit')
        .ilike('metric_code', 'E1-%');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      for (const row of data!) {
        if (row.metric_code.includes('scope') || row.metric_code.includes('total')) {
          expect(row.unit).toBe('tonnes CO2e');
        }
      }
    });

    it('should have percentage values in valid range', async () => {
      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('metric_code, value')
        .or('metric_code.ilike.%percent%,metric_code.ilike.%ratio%');

      expect(error).toBeNull();

      if (data && data.length > 0) {
        for (const row of data) {
          expect(row.value).toBeGreaterThanOrEqual(0);
          expect(row.value).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('Data Lineage & Audit Trail', () => {
    it('should have data lineage edges', async () => {
      const { data, error } = await supabase
        .from('data_lineage_edges')
        .select('*')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      const sample = data![0];
      expect(sample.from_ref).toBeDefined();
      expect(sample.to_ref).toBeDefined();
      expect(sample.relation_type).toBeDefined();
    });

    it('should have audit trail entries', async () => {
      const { data, error } = await supabase
        .from('esg_ingestion_audit')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      const sample = data![0];
      expect(sample.event_type).toBeDefined();
      expect(sample.input_hash).toBeDefined();
      expect(sample.output_hash).toBeDefined();
    });

    it('should have intact hash chain', async () => {
      const { data, error } = await supabase
        .from('esg_ingestion_audit')
        .select('*')
        .order('occurred_at', { ascending: true })
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          if (data[i].prev_hash && data[i - 1].output_hash) {
            expect(data[i].prev_hash).toBe(data[i - 1].output_hash);
          }
        }
      }
    });
  });

  describe('Performance & Scalability', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('esg_kpi_results')
        .select('*')
        .limit(1000);

      const duration = Date.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should support pagination', async () => {
      const { data, error } = await supabase
        .from('staging_rows')
        .select('*', { count: 'exact' })
        .range(0, 9);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeLessThanOrEqual(10);
    });
  });
});
