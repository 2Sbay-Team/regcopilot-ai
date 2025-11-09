import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="test-ui-theme">
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const mockOrganization = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test Organization',
  country_code: 'US',
  created_at: new Date().toISOString(),
};

export const mockProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'test@example.com',
  full_name: 'Test User',
  organization_id: mockOrganization.id,
  created_at: new Date().toISOString(),
};

export const mockAIActAssessment = {
  id: '00000000-0000-0000-0000-000000000003',
  organization_id: mockOrganization.id,
  system_name: 'Test AI System',
  risk_category: 'high',
  annex_iv_summary: 'Test summary',
  created_at: new Date().toISOString(),
};

export const mockGDPRAssessment = {
  id: '00000000-0000-0000-0000-000000000004',
  organization_id: mockOrganization.id,
  violations: { pii_detected: ['email', 'phone'] },
  summary: 'GDPR assessment summary',
  created_at: new Date().toISOString(),
};

export const mockESGReport = {
  id: '00000000-0000-0000-0000-000000000005',
  organization_id: mockOrganization.id,
  metrics: { carbon_emissions: 1000, energy_usage: 500 },
  narrative: 'ESG report narrative',
  completeness: 0.85,
  created_at: new Date().toISOString(),
};

export const mockAuditLog = {
  id: '00000000-0000-0000-0000-000000000006',
  organization_id: mockOrganization.id,
  module: 'ai_act',
  action: 'classify',
  input_hash: 'abc123',
  output_hash: 'def456',
  prev_hash: '000000',
  reasoning: 'Test reasoning',
  timestamp: new Date().toISOString(),
};
