import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { GlobalHelpSearch } from "@/components/GlobalHelpSearch";
import { GuidedTour } from "@/components/GuidedTour";
import '@/i18n/config' // Import i18n configuration
import { lazy, Suspense } from "react";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const TrustCenter = lazy(() => import("./pages/TrustCenter"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const DPA = lazy(() => import("./pages/DPA"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIActCopilot = lazy(() => import("./pages/AIActCopilot"));
const GDPRCopilot = lazy(() => import("./pages/GDPRCopilot"));
const ESGCopilot = lazy(() => import("./pages/ESGCopilot"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const ModelRegistry = lazy(() => import("./pages/ModelRegistry"));
const Explainability = lazy(() => import("./pages/Explainability"));
const Admin = lazy(() => import("./pages/Admin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const RAGSearch = lazy(() => import("./pages/RAGSearch"));
const SystemSetup = lazy(() => import("./pages/SystemSetup"));
const DataLineage = lazy(() => import("./pages/DataLineage"));
const DSARManagement = lazy(() => import("./pages/DSARManagement"));
const AuditChainVerify = lazy(() => import("./pages/AuditChainVerify"));
const AIGateway = lazy(() => import("./pages/AIGateway"));
const Usage = lazy(() => import("./pages/Usage"));
const Prompts = lazy(() => import("./pages/Prompts"));
const LLMSettings = lazy(() => import("./pages/LLMSettings"));
const ModelGovernance = lazy(() => import("./pages/ModelGovernance"));
const LLMAnalytics = lazy(() => import("./pages/LLMAnalytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const ModelManagement = lazy(() => import("./pages/ModelManagement"));
const ComplianceScore = lazy(() => import("./pages/ComplianceScore"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Impressum = lazy(() => import("./pages/Impressum"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NIS2Copilot = lazy(() => import("./pages/NIS2Copilot"));
const DORACopilot = lazy(() => import("./pages/DORACopilot"));
const DMACopilot = lazy(() => import("./pages/DMACopilot"));
const AgentTasks = lazy(() => import("./pages/AgentTasks"));
const Connectors = lazy(() => import("./pages/Connectors"));
const SocialSentiment = lazy(() => import("./pages/SocialSentiment"));
const MFASetup = lazy(() => import("./pages/MFASetup"));
const ContinuousIntelligence = lazy(() => import("./pages/ContinuousIntelligence"));
const ScheduledJobs = lazy(() => import("./pages/ScheduledJobs"));
const FeedbackAnalytics = lazy(() => import("./pages/FeedbackAnalytics"));
const HelpInsights = lazy(() => import("./pages/admin/HelpInsights"));
const DocumentationTools = lazy(() => import("./pages/admin/DocumentationTools"));
const AdminHelp = lazy(() => import("./pages/admin/Help"));
const AdminGuide = lazy(() => import("./pages/admin/AdminGuide"));
const RegulationUploader = lazy(() => import("./pages/admin/RegulationUploader"));
const UploadPolicies = lazy(() => import("./pages/admin/UploadPolicies"));
const RiskRegister = lazy(() => import("./pages/RiskRegister"));
const DSARQueue = lazy(() => import("./pages/DSARQueue"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const BrandComparison = lazy(() => import("./pages/BrandComparison"));
const Automation = lazy(() => import("./pages/Automation"));
const AuditPortal = lazy(() => import("./pages/AuditPortal"));
const SecurityPrivacy = lazy(() => import("./pages/SecurityPrivacy"));
const TeamManagement = lazy(() => import("./pages/admin/TeamManagement"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const OrgBilling = lazy(() => import("./pages/OrgBilling"));
const OrganizationSettings = lazy(() => import("./pages/OrganizationSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SecurityCompliance = lazy(() => import("./pages/SecurityCompliance"));
const CICDSetup = lazy(() => import("./pages/CICDSetup"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const ModuleManagement = lazy(() => import("./pages/ModuleManagement"));
const QADashboard = lazy(() => import("./pages/QADashboard"));
const RoleGuard = lazy(() => import("./components/RoleGuard"));
const ESGDataSources = lazy(() => import("@/pages/ESGDataSources"));
const ESGDataLineage = lazy(() => import("@/pages/ESGDataLineage"));
const ESGReports = lazy(() => import("@/pages/ESGReports"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <GlobalHelpSearch />
            <GuidedTour />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
            {/* Public Pages - No Authentication Required */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/trust-center" element={<TrustCenter />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Public Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/security-privacy" element={<SecurityPrivacy />} />
              <Route path="/dpa" element={<DPA />} />
              <Route path="/impressum" element={<Impressum />} />
              
              {/* Protected Product & Dashboard Pages */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-act" element={<ProtectedRoute><AppLayout><AIActCopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/gdpr" element={<ProtectedRoute><AppLayout><GDPRCopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/esg" element={<ProtectedRoute><AppLayout><ESGCopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/esg-reports" element={<ProtectedRoute><AppLayout><ESGReports /></AppLayout></ProtectedRoute>} />
            <Route path="/esg-data-sources" element={<ProtectedRoute><AppLayout><ESGDataSources /></AppLayout></ProtectedRoute>} />
            <Route path="/esg-data-lineage" element={<ProtectedRoute><AppLayout><ESGDataLineage /></AppLayout></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AppLayout><AuditTrail /></AppLayout></ProtectedRoute>} />
            <Route path="/models" element={<ProtectedRoute><AppLayout><ModelRegistry /></AppLayout></ProtectedRoute>} />
            <Route path="/explainability" element={<ProtectedRoute><AppLayout><Explainability /></AppLayout></ProtectedRoute>} />
            <Route path="/data-lineage" element={<ProtectedRoute><AppLayout><DataLineage /></AppLayout></ProtectedRoute>} />
            <Route path="/dsar" element={<ProtectedRoute><AppLayout><DSARManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/audit-verify" element={<ProtectedRoute><AppLayout><AuditChainVerify /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            <Route path="/rag-search" element={<ProtectedRoute><AppLayout><RAGSearch /></AppLayout></ProtectedRoute>} />
            <Route path="/setup" element={<ProtectedRoute><AppLayout><SystemSetup /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-gateway" element={<ProtectedRoute><AppLayout><AIGateway /></AppLayout></ProtectedRoute>} />
            <Route path="/model-registry" element={<ProtectedRoute><AppLayout><ModelRegistry /></AppLayout></ProtectedRoute>} />
            <Route path="/usage" element={<ProtectedRoute><AppLayout><Usage /></AppLayout></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><AppLayout><OrgBilling /></AppLayout></ProtectedRoute>} />
            <Route path="/prompts" element={<ProtectedRoute><AppLayout><Prompts /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/llm" element={<ProtectedRoute><AppLayout><LLMSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/model-governance" element={<ProtectedRoute><AppLayout><ModelGovernance /></AppLayout></ProtectedRoute>} />
            <Route path="/llm-analytics" element={<ProtectedRoute><AppLayout><LLMAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/model-management" element={<ProtectedRoute><AppLayout><ModelManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/compliance-score" element={<ProtectedRoute><AppLayout><ComplianceScore /></AppLayout></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
            <Route path="/nis2" element={<ProtectedRoute><AppLayout><NIS2Copilot /></AppLayout></ProtectedRoute>} />
            <Route path="/dora" element={<ProtectedRoute><AppLayout><DORACopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/dora-copilot" element={<ProtectedRoute><AppLayout><DORACopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/dma" element={<ProtectedRoute><AppLayout><DMACopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AppLayout><AgentTasks /></AppLayout></ProtectedRoute>} />
            <Route path="/connectors" element={<ProtectedRoute><AppLayout><Connectors /></AppLayout></ProtectedRoute>} />
            <Route path="/social-sentiment" element={<ProtectedRoute><AppLayout><SocialSentiment /></AppLayout></ProtectedRoute>} />
            <Route path="/mfa-setup" element={<ProtectedRoute><MFASetup /></ProtectedRoute>} />
            <Route path="/continuous-intelligence" element={<ProtectedRoute><AppLayout><ContinuousIntelligence /></AppLayout></ProtectedRoute>} />
            <Route path="/scheduled-jobs" element={<ProtectedRoute><AppLayout><ScheduledJobs /></AppLayout></ProtectedRoute>} />
            <Route path="/feedback-analytics" element={<ProtectedRoute><AppLayout><FeedbackAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/help" element={<ProtectedRoute><AppLayout><AdminHelp /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/help-insights" element={<ProtectedRoute><AppLayout><HelpInsights /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/documentation-tools" element={<ProtectedRoute><AppLayout><DocumentationTools /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/guide" element={<ProtectedRoute><AppLayout><AdminGuide /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/regulations" element={<ProtectedRoute><AppLayout><RegulationUploader /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/upload-policies" element={<ProtectedRoute><AppLayout><UploadPolicies /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/rag-insights" element={<ProtectedRoute><AppLayout><FeedbackAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/risk-register" element={<ProtectedRoute><AppLayout><RiskRegister /></AppLayout></ProtectedRoute>} />
            <Route path="/dsar-queue" element={<ProtectedRoute><AppLayout><DSARQueue /></AppLayout></ProtectedRoute>} />
            <Route path="/security-center" element={<ProtectedRoute><AppLayout><SecurityCenter /></AppLayout></ProtectedRoute>} />
            <Route path="/security-compliance" element={<ProtectedRoute><AppLayout><SecurityCompliance /></AppLayout></ProtectedRoute>} />
            <Route path="/cicd-setup" element={<ProtectedRoute><AppLayout><CICDSetup /></AppLayout></ProtectedRoute>} />
            <Route path="/system-health" element={<ProtectedRoute><AppLayout><SystemHealth /></AppLayout></ProtectedRoute>} />
            <Route path="/module-management" element={<ProtectedRoute><AppLayout><ModuleManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/qa-dashboard" element={<ProtectedRoute><RoleGuard requiredRole="admin"><AppLayout><QADashboard /></AppLayout></RoleGuard></ProtectedRoute>} />
            <Route path="/user-guide" element={<ProtectedRoute><AppLayout><UserGuide /></AppLayout></ProtectedRoute>} />
            <Route path="/help-center" element={<ProtectedRoute><AppLayout><HelpCenter /></AppLayout></ProtectedRoute>} />
            <Route path="/brand-comparison" element={<ProtectedRoute><BrandComparison /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AppLayout><Automation /></AppLayout></ProtectedRoute>} />
            <Route path="/audit-portal" element={<ProtectedRoute><AuditPortal /></ProtectedRoute>} />
            <Route path="/admin/team" element={<ProtectedRoute><AppLayout><TeamManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/organization" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
