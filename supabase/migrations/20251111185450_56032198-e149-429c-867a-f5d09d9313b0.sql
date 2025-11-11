-- Enhanced ESG Data Lineage and KPI Extraction

-- Table for tracking data lineage
CREATE TABLE IF NOT EXISTS esg_data_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  source_id UUID REFERENCES esg_data_lake(id),
  connector_id UUID REFERENCES esg_connectors(id),
  transformation_type TEXT, -- 'extract', 'clean', 'normalize', 'aggregate', 'join'
  input_data JSONB,
  output_data JSONB,
  quality_score NUMERIC,
  lineage_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for extracted KPIs
CREATE TABLE IF NOT EXISTS esg_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  esrs_module TEXT NOT NULL, -- E1, E2, etc.
  kpi_name TEXT NOT NULL,
  kpi_value NUMERIC,
  kpi_unit TEXT,
  calculation_method TEXT,
  data_sources UUID[],
  confidence_score NUMERIC,
  fiscal_year INTEGER,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  validated BOOLEAN DEFAULT false,
  metadata JSONB
);

-- Table for data quality rules
CREATE TABLE IF NOT EXISTS esg_data_quality_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT, -- 'range', 'format', 'completeness', 'consistency'
  target_metric TEXT,
  rule_definition JSONB,
  severity TEXT, -- 'error', 'warning', 'info'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for regulation monitoring
CREATE TABLE IF NOT EXISTS esg_regulation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_name TEXT NOT NULL,
  regulation_type TEXT, -- 'ESRS', 'CSRD', 'SFDR', etc.
  version TEXT,
  effective_date DATE,
  summary TEXT,
  impact_assessment TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_esg_lineage_org ON esg_data_lineage(organization_id);
CREATE INDEX IF NOT EXISTS idx_esg_lineage_source ON esg_data_lineage(source_id);
CREATE INDEX IF NOT EXISTS idx_esg_kpis_org_module ON esg_kpis(organization_id, esrs_module);
CREATE INDEX IF NOT EXISTS idx_esg_kpis_fiscal_year ON esg_kpis(fiscal_year);

-- Enable RLS
ALTER TABLE esg_data_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_data_quality_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_regulation_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view lineage for their organization"
  ON esg_data_lineage FOR SELECT
  USING (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Users can insert lineage for their organization"
  ON esg_data_lineage FOR INSERT
  WITH CHECK (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Users can view KPIs for their organization"
  ON esg_kpis FOR SELECT
  USING (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Users can insert KPIs for their organization"
  ON esg_kpis FOR INSERT
  WITH CHECK (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Users can update KPIs for their organization"
  ON esg_kpis FOR UPDATE
  USING (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Users can view quality rules for their organization"
  ON esg_data_quality_rules FOR SELECT
  USING (organization_id = (SELECT get_user_organization_id(auth.uid())));

CREATE POLICY "Admins can manage quality rules"
  ON esg_data_quality_rules FOR ALL
  USING (
    organization_id = (SELECT get_user_organization_id(auth.uid()))
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Anyone can view regulation updates"
  ON esg_regulation_updates FOR SELECT
  USING (true);