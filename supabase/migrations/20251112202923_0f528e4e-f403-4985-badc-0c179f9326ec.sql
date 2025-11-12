-- ESG Ingestion & Mapping Schema (only create missing tables)
-- 1) Source Schema Cache
CREATE TABLE IF NOT EXISTS public.source_schema_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL,
  table_name text NOT NULL,
  column_name text NOT NULL,
  data_type text,
  is_primary_key boolean DEFAULT false,
  is_foreign_key boolean DEFAULT false,
  fk_target_table text,
  fk_target_column text,
  sampled boolean DEFAULT false,
  sample_preview jsonb DEFAULT '{}'::jsonb,
  captured_at timestamptz DEFAULT now()
);

-- 2) Staging Rows (landing area for extracted rows)
CREATE TABLE IF NOT EXISTS public.staging_rows (
  id bigserial PRIMARY KEY,
  connector_id uuid NOT NULL,
  source_table text NOT NULL,
  payload jsonb NOT NULL,
  source_hash char(64) NOT NULL,
  period date,
  arrived_at timestamptz DEFAULT now()
);

-- 3) Mapping Profiles
CREATE TABLE IF NOT EXISTS public.mapping_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Mapping Tables (tables included in a profile)
CREATE TABLE IF NOT EXISTS public.mapping_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  source_table text NOT NULL,
  table_alias text,
  connector_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 5) Mapping Joins
CREATE TABLE IF NOT EXISTS public.mapping_joins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  left_table text NOT NULL,
  right_table text NOT NULL,
  left_key text NOT NULL,
  right_key text NOT NULL,
  join_type text NOT NULL DEFAULT 'inner',
  confidence_score numeric,
  created_at timestamptz DEFAULT now()
);

-- 6) Mapping Fields
CREATE TABLE IF NOT EXISTS public.mapping_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  source_table text NOT NULL,
  source_column text NOT NULL,
  target_metric_code text NOT NULL,
  unit text,
  transform jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 7) KPI Rules
CREATE TABLE IF NOT EXISTS public.esg_kpi_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  metric_code text NOT NULL,
  formula jsonb NOT NULL,
  unit text,
  esrs_reference text,
  version int DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 8) KPI Results
CREATE TABLE IF NOT EXISTS public.esg_kpi_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  metric_code text NOT NULL,
  period text NOT NULL,
  value numeric NOT NULL,
  unit text,
  lineage jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now(),
  source_profile_id uuid,
  quality_score numeric
);

-- Ensure deterministic upsert target
CREATE UNIQUE INDEX IF NOT EXISTS idx_esg_kpi_results_unique ON public.esg_kpi_results (organization_id, metric_code, period);

-- 9) Ingestion Audit (hash-chained)
CREATE TABLE IF NOT EXISTS public.esg_ingestion_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  event_type text NOT NULL,
  input_hash char(64) NOT NULL,
  output_hash char(64) NOT NULL,
  prev_hash char(64),
  metadata jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz DEFAULT now()
);

-- 10) Data Lineage Edges
CREATE TABLE IF NOT EXISTS public.data_lineage_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  from_reference text NOT NULL,
  to_reference text NOT NULL,
  relation_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 11) Connector Sync State
CREATE TABLE IF NOT EXISTS public.connector_sync_state (
  connector_id uuid PRIMARY KEY,
  last_cursor text,
  last_row_id bigint,
  last_window_start timestamptz,
  last_window_end timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_staging_rows_connector_arrived ON public.staging_rows (connector_id, arrived_at);
CREATE INDEX IF NOT EXISTS idx_source_schema_cache_connector_table ON public.source_schema_cache (connector_id, table_name);
CREATE INDEX IF NOT EXISTS idx_kpi_results_org_metric_period ON public.esg_kpi_results (organization_id, metric_code, period);

-- RLS Enablement
ALTER TABLE public.source_schema_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_joins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_kpi_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_ingestion_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lineage_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_sync_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Org-scoped)
-- Mapping Profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mapping_profiles' AND policyname = 'Users can view mapping profiles in their org'
  ) THEN
    CREATE POLICY "Users can view mapping profiles in their org"
      ON public.mapping_profiles FOR SELECT
      USING (organization_id = get_user_organization_id(auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mapping_profiles' AND policyname = 'Analyst/Admin can insert mapping profiles'
  ) THEN
    CREATE POLICY "Analyst/Admin can insert mapping profiles"
      ON public.mapping_profiles FOR INSERT
      WITH CHECK (
        organization_id = get_user_organization_id(auth.uid()) AND 
        (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'mapping_profiles' AND policyname = 'Analyst/Admin can update mapping profiles'
  ) THEN
    CREATE POLICY "Analyst/Admin can update mapping profiles"
      ON public.mapping_profiles FOR UPDATE
      USING (
        organization_id = get_user_organization_id(auth.uid()) AND 
        (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      );
  END IF;
END$$;

-- Mapping children tables (tables/joins/fields) scoping via profile org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_tables' AND policyname='Users can view mapping tables in their org'
  ) THEN
    CREATE POLICY "Users can view mapping tables in their org"
      ON public.mapping_tables FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid())
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_tables' AND policyname='Analyst/Admin can manage mapping tables'
  ) THEN
    CREATE POLICY "Analyst/Admin can manage mapping tables"
      ON public.mapping_tables FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_joins' AND policyname='Users can view mapping joins in their org'
  ) THEN
    CREATE POLICY "Users can view mapping joins in their org"
      ON public.mapping_joins FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid())
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_joins' AND policyname='Analyst/Admin can manage mapping joins'
  ) THEN
    CREATE POLICY "Analyst/Admin can manage mapping joins"
      ON public.mapping_joins FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_fields' AND policyname='Users can view mapping fields in their org'
  ) THEN
    CREATE POLICY "Users can view mapping fields in their org"
      ON public.mapping_fields FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid())
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='mapping_fields' AND policyname='Analyst/Admin can manage mapping fields'
  ) THEN
    CREATE POLICY "Analyst/Admin can manage mapping fields"
      ON public.mapping_fields FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.mapping_profiles mp 
        WHERE mp.id = profile_id AND mp.organization_id = get_user_organization_id(auth.uid()) AND (has_role(auth.uid(),'analyst') OR has_role(auth.uid(),'admin'))
      ));
  END IF;
END$$;

-- Source schema cache & staging rows via connectors org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='source_schema_cache' AND policyname='Users can view source schema in their org'
  ) THEN
    CREATE POLICY "Users can view source schema in their org"
      ON public.source_schema_cache FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.connectors c 
        WHERE c.id = connector_id AND c.organization_id = get_user_organization_id(auth.uid())
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='staging_rows' AND policyname='Users can view staging rows in their org'
  ) THEN
    CREATE POLICY "Users can view staging rows in their org"
      ON public.staging_rows FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.connectors c 
        WHERE c.id = connector_id AND c.organization_id = get_user_organization_id(auth.uid())
      ));
  END IF;
END$$;

-- KPI rules & results, ingestion audit, lineage (org-based)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_kpi_rules' AND policyname='Users can view KPI rules in their org') THEN
    CREATE POLICY "Users can view KPI rules in their org"
      ON public.esg_kpi_rules FOR SELECT
      USING (organization_id = get_user_organization_id(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_kpi_results' AND policyname='Users can view KPI results in their org') THEN
    CREATE POLICY "Users can view KPI results in their org"
      ON public.esg_kpi_results FOR SELECT
      USING (organization_id = get_user_organization_id(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_ingestion_audit' AND policyname='Users can view ESG ingestion audit in their org') THEN
    CREATE POLICY "Users can view ESG ingestion audit in their org"
      ON public.esg_ingestion_audit FOR SELECT
      USING (organization_id = get_user_organization_id(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_lineage_edges' AND policyname='Users can view data lineage in their org') THEN
    CREATE POLICY "Users can view data lineage in their org"
      ON public.data_lineage_edges FOR SELECT
      USING (organization_id = get_user_organization_id(auth.uid()));
  END IF;
END$$;

-- Service role policies to allow edge functions to insert
DO $$
BEGIN
  -- Allow inserts by service role (checked via service key at runtime)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='source_schema_cache' AND policyname='Service role can insert schema cache') THEN
    CREATE POLICY "Service role can insert schema cache" ON public.source_schema_cache FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staging_rows' AND policyname='Service role can insert staging rows') THEN
    CREATE POLICY "Service role can insert staging rows" ON public.staging_rows FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mapping_tables' AND policyname='Service role can insert mapping tables') THEN
    CREATE POLICY "Service role can insert mapping tables" ON public.mapping_tables FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mapping_joins' AND policyname='Service role can insert mapping joins') THEN
    CREATE POLICY "Service role can insert mapping joins" ON public.mapping_joins FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='mapping_fields' AND policyname='Service role can insert mapping fields') THEN
    CREATE POLICY "Service role can insert mapping fields" ON public.mapping_fields FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_kpi_rules' AND policyname='Service role can insert KPI rules') THEN
    CREATE POLICY "Service role can insert KPI rules" ON public.esg_kpi_rules FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_kpi_results' AND policyname='Service role can upsert KPI results') THEN
    CREATE POLICY "Service role can upsert KPI results" ON public.esg_kpi_results FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='esg_ingestion_audit' AND policyname='Service role can insert ingestion audit') THEN
    CREATE POLICY "Service role can insert ingestion audit" ON public.esg_ingestion_audit FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='data_lineage_edges' AND policyname='Service role can insert lineage') THEN
    CREATE POLICY "Service role can insert lineage" ON public.data_lineage_edges FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connector_sync_state' AND policyname='Service role can manage connector sync state') THEN
    CREATE POLICY "Service role can manage connector sync state" ON public.connector_sync_state FOR ALL USING (true) WITH CHECK (true);
  END IF;
END$$;