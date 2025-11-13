-- ESG Validation Results Table
CREATE TABLE IF NOT EXISTS esg_validation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'warning', 'fail')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  affected_kpis TEXT[] DEFAULT ARRAY[]::TEXT[],
  details JSONB DEFAULT '{}'::JSONB,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE esg_validation_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their org's validation results"
  ON esg_validation_results FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can insert validation results"
  ON esg_validation_results FOR INSERT
  WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_esg_validation_org_date
  ON esg_validation_results(organization_id, validated_at DESC);

CREATE INDEX idx_esg_validation_status
  ON esg_validation_results(organization_id, status, severity);