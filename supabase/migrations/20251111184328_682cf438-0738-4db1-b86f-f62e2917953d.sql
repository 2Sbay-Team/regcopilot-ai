-- ESG Data Integration Infrastructure for Multi-Tenant System

-- External System Connectors Configuration
CREATE TABLE IF NOT EXISTS public.esg_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector_name TEXT NOT NULL,
  connector_type TEXT NOT NULL CHECK (connector_type IN ('sap', 'databricks', 's3', 'database', 'excel', 'jira', 'pdf', 'hr_system')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'configured')),
  
  -- Encrypted connection credentials
  connection_config JSONB NOT NULL DEFAULT '{}',
  
  -- Sync configuration
  sync_schedule TEXT, -- cron expression
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, connector_name)
);

-- ESG Data Lake - Centralized validated data repository
CREATE TABLE IF NOT EXISTS public.esg_data_lake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Source provenance
  connector_id UUID REFERENCES public.esg_connectors(id) ON DELETE SET NULL,
  source_system TEXT NOT NULL, -- SAP, Databricks, etc.
  source_file TEXT,
  source_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  ingestion_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Data classification
  esrs_module TEXT NOT NULL CHECK (esrs_module IN ('E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1', 'ESRS1', 'ESRS2')),
  metric_category TEXT NOT NULL, -- 'emissions', 'energy', 'water', 'workforce', 'governance', etc.
  metric_name TEXT NOT NULL,
  
  -- Data content
  raw_value JSONB NOT NULL, -- Original data as ingested
  normalized_value JSONB NOT NULL, -- Cleaned and standardized
  unit TEXT,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  
  -- Validation and quality
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'flagged', 'rejected')),
  validation_rules_applied JSONB DEFAULT '[]',
  anomaly_flags JSONB DEFAULT '[]',
  quality_score NUMERIC(3,2), -- 0.00 to 1.00
  
  -- Audit trail
  version INTEGER NOT NULL DEFAULT 1,
  correction_history JSONB DEFAULT '[]',
  audit_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES auth.users(id)
);

-- Data Source Mapping Profiles (per connector)
CREATE TABLE IF NOT EXISTS public.esg_data_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.esg_connectors(id) ON DELETE CASCADE,
  
  -- Field mapping configuration
  source_field TEXT NOT NULL,
  target_esrs_module TEXT NOT NULL,
  target_metric TEXT NOT NULL,
  transformation_rules JSONB DEFAULT '{}', -- Unit conversions, calculations, etc.
  
  -- Validation rules
  validation_rules JSONB DEFAULT '{}',
  expected_data_type TEXT,
  required BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(connector_id, source_field, target_metric)
);

-- Sync execution logs
CREATE TABLE IF NOT EXISTS public.esg_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.esg_connectors(id) ON DELETE CASCADE,
  
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_validated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  error_details JSONB,
  execution_log TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ESRS Module Definitions
CREATE TABLE IF NOT EXISTS public.esrs_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT NOT NULL UNIQUE, -- E1, E2, S1, etc.
  module_name TEXT NOT NULL,
  module_category TEXT NOT NULL CHECK (module_category IN ('Environmental', 'Social', 'Governance', 'Cross-cutting')),
  
  -- CSRD requirements
  required_disclosures JSONB NOT NULL DEFAULT '[]',
  required_kpis JSONB NOT NULL DEFAULT '[]',
  materiality_assessment_required BOOLEAN DEFAULT true,
  
  description TEXT,
  regulatory_reference TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert ESRS module definitions
INSERT INTO public.esrs_modules (module_code, module_name, module_category, description, required_disclosures, required_kpis) VALUES
  ('ESRS1', 'General Requirements', 'Cross-cutting', 'General principles and requirements for sustainability reporting', '["governance", "strategy", "materiality_assessment", "policies", "actions", "targets", "metrics"]', '[]'),
  ('ESRS2', 'General Disclosures', 'Cross-cutting', 'General information about the undertaking', '["basis_of_preparation", "value_chain", "stakeholder_engagement"]', '[]'),
  ('E1', 'Climate Change', 'Environmental', 'Climate change mitigation and adaptation', '["transition_plan", "ghg_emissions", "energy", "removals"]', '["scope_1_emissions", "scope_2_emissions", "scope_3_emissions", "energy_consumption", "renewable_energy_ratio"]'),
  ('E2', 'Pollution', 'Environmental', 'Pollution of air, water and soil', '["pollution_prevention", "substances_of_concern"]', '["air_pollutants", "water_pollutants", "soil_pollutants"]'),
  ('E3', 'Water and Marine Resources', 'Environmental', 'Water consumption and marine resources', '["water_management", "marine_resources"]', '["water_consumption", "water_discharge", "water_recycling_rate"]'),
  ('E4', 'Biodiversity and Ecosystems', 'Environmental', 'Impact on biodiversity and ecosystems', '["impact_assessment", "mitigation_actions"]', '["land_use", "protected_areas_impact", "biodiversity_restoration"]'),
  ('E5', 'Resource Use and Circular Economy', 'Environmental', 'Resource inflows and circular economy', '["resource_efficiency", "circular_design", "waste_management"]', '["material_consumption", "waste_generated", "recycling_rate"]'),
  ('S1', 'Own Workforce', 'Social', 'Working conditions and equal treatment', '["working_conditions", "equal_treatment", "health_safety"]', '["workforce_size", "diversity_metrics", "training_hours", "accident_rate"]'),
  ('S2', 'Workers in Value Chain', 'Social', 'Working conditions in the value chain', '["due_diligence", "supplier_engagement"]', '["supplier_audits", "non_compliance_incidents"]'),
  ('S3', 'Affected Communities', 'Social', 'Communities affected by operations', '["community_engagement", "impact_assessment"]', '["community_investments", "grievances_filed"]'),
  ('S4', 'Consumers and End-users', 'Social', 'Consumer and end-user information', '["product_safety", "consumer_protection"]', '["product_recalls", "consumer_complaints"]'),
  ('G1', 'Business Conduct', 'Governance', 'Corporate culture, anti-corruption and political engagement', '["corporate_culture", "anti_corruption", "political_engagement"]', '["corruption_incidents", "whistleblower_reports", "political_contributions"]')
ON CONFLICT (module_code) DO NOTHING;

-- RLS Policies
ALTER TABLE public.esg_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_data_lake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esrs_modules ENABLE ROW LEVEL SECURITY;

-- Connectors policies
CREATE POLICY "Users can view their org connectors"
  ON public.esg_connectors FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage their org connectors"
  ON public.esg_connectors FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Data lake policies
CREATE POLICY "Users can view their org data"
  ON public.esg_data_lake FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Analysts can validate data"
  ON public.esg_data_lake FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'analyst'))
  );

CREATE POLICY "System can insert data"
  ON public.esg_data_lake FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Mappings policies
CREATE POLICY "Users can view their org mappings"
  ON public.esg_data_mappings FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage mappings"
  ON public.esg_data_mappings FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Sync logs policies
CREATE POLICY "Users can view their org sync logs"
  ON public.esg_sync_logs FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- ESRS modules are public reference data
CREATE POLICY "Anyone can view ESRS modules"
  ON public.esrs_modules FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX idx_esg_connectors_org ON public.esg_connectors(organization_id);
CREATE INDEX idx_esg_data_lake_org ON public.esg_data_lake(organization_id);
CREATE INDEX idx_esg_data_lake_esrs ON public.esg_data_lake(esrs_module, metric_category);
CREATE INDEX idx_esg_data_lake_period ON public.esg_data_lake(reporting_period_start, reporting_period_end);
CREATE INDEX idx_esg_data_lake_validation ON public.esg_data_lake(validation_status);
CREATE INDEX idx_esg_sync_logs_connector ON public.esg_sync_logs(connector_id);

-- Trigger for updated_at
CREATE TRIGGER update_esg_connectors_updated_at
  BEFORE UPDATE ON public.esg_connectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esg_data_mappings_updated_at
  BEFORE UPDATE ON public.esg_data_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();