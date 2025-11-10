-- Create compliance_controls table first
CREATE TABLE IF NOT EXISTS compliance_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  control_id TEXT NOT NULL, -- e.g., 'A.5.1' or 'CC6.1'
  framework TEXT NOT NULL, -- 'SOC2', 'ISO27001', 'GDPR'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'verified')),
  owner TEXT,
  required_for TEXT[], -- e.g., ['SOC2', 'ISO27001']
  evidence_url TEXT,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  implementation_notes TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add dependency_vulnerabilities table for tracking library weaknesses
CREATE TABLE IF NOT EXISTS dependency_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  package_name TEXT NOT NULL,
  package_version TEXT NOT NULL,
  vulnerability_id TEXT NOT NULL, -- CVE ID or similar
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  description TEXT,
  cvss_score NUMERIC,
  fixed_version TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'patched', 'ignored', 'mitigated')),
  source TEXT, -- 'npm', 'pip', 'nvd', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add audit_evidence table for compliance documentation
CREATE TABLE IF NOT EXISTS audit_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  control_id UUID REFERENCES compliance_controls(id),
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add security_scan_history for tracking scan runs
CREATE TABLE IF NOT EXISTS security_scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  scan_type TEXT NOT NULL, -- 'sast', 'sca', 'dast', 'full'
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  vulnerabilities_found INTEGER DEFAULT 0,
  dependencies_scanned INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  scan_metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE compliance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependency_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_controls
CREATE POLICY "Users can view their org's compliance controls"
  ON compliance_controls FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage compliance controls"
  ON compliance_controls FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid()) AND
    has_role(auth.uid(), 'admin'::app_role)
  );

-- RLS Policies for dependency_vulnerabilities
CREATE POLICY "Users can view their org's dependency vulnerabilities"
  ON dependency_vulnerabilities FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage dependency vulnerabilities"
  ON dependency_vulnerabilities FOR ALL
  USING (true);

-- RLS Policies for audit_evidence
CREATE POLICY "Users can view their org's audit evidence"
  ON audit_evidence FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can manage audit evidence"
  ON audit_evidence FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid()) AND
    (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- RLS Policies for security_scan_history
CREATE POLICY "Users can view their org's scan history"
  ON security_scan_history FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage scan history"
  ON security_scan_history FOR ALL
  USING (true);

-- Add indexes for performance
CREATE INDEX idx_compliance_controls_org ON compliance_controls(organization_id);
CREATE INDEX idx_compliance_controls_framework ON compliance_controls(framework);
CREATE INDEX idx_dependency_vulnerabilities_org ON dependency_vulnerabilities(organization_id);
CREATE INDEX idx_dependency_vulnerabilities_status ON dependency_vulnerabilities(status);
CREATE INDEX idx_audit_evidence_org ON audit_evidence(organization_id);
CREATE INDEX idx_audit_evidence_control ON audit_evidence(control_id);
CREATE INDEX idx_security_scan_history_org ON security_scan_history(organization_id);