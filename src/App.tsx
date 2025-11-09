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
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AIActCopilot from "./pages/AIActCopilot";
import GDPRCopilot from "./pages/GDPRCopilot";
import ESGCopilot from "./pages/ESGCopilot";
import AuditTrail from "./pages/AuditTrail";
import ModelRegistry from "./pages/ModelRegistry";
import Explainability from "./pages/Explainability";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import RAGSearch from "./pages/RAGSearch";
import SystemSetup from "./pages/SystemSetup";
import DataLineage from "./pages/DataLineage";
import DSARManagement from "./pages/DSARManagement";
import AuditChainVerify from "./pages/AuditChainVerify";
import AIGateway from "./pages/AIGateway";
import Usage from "./pages/Usage";
import Prompts from "./pages/Prompts";
import LLMSettings from "./pages/LLMSettings";
import ModelGovernance from "./pages/ModelGovernance";
import LLMAnalytics from "./pages/LLMAnalytics";
import Settings from "./pages/Settings";
import ModelManagement from "./pages/ModelManagement";
import ComplianceScore from "./pages/ComplianceScore";
import Marketplace from "./pages/Marketplace";
import Impressum from "./pages/Impressum";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NIS2Copilot from "./pages/NIS2Copilot";
import DORACopilot from "./pages/DORACopilot";
import DMACopilot from "./pages/DMACopilot";
import AgentTasks from "./pages/AgentTasks";
import Connectors from "./pages/Connectors";
import SocialSentiment from "./pages/SocialSentiment";
import MFASetup from "./pages/MFASetup";
import ContinuousIntelligence from "./pages/ContinuousIntelligence";
import ScheduledJobs from "./pages/ScheduledJobs";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import AdminHelp from "./pages/admin/Help";
import AdminGuide from "./pages/admin/AdminGuide";
import RegulationUploader from "./pages/admin/RegulationUploader";
import UploadPolicies from "./pages/admin/UploadPolicies";
import RiskRegister from "./pages/RiskRegister";
import DSARQueue from "./pages/DSARQueue";
import SecurityCenter from "./pages/SecurityCenter";
import UserGuide from "./pages/UserGuide";
import HelpCenter from "./pages/HelpCenter";
import RegSense from "./pages/RegSense";
import BrandComparison from "./pages/BrandComparison";
import Automation from "./pages/Automation";
import AuditPortal from "./pages/AuditPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/ai-act" element={<ProtectedRoute><AppLayout><AIActCopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/gdpr" element={<ProtectedRoute><AppLayout><GDPRCopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/esg" element={<ProtectedRoute><AppLayout><ESGCopilot /></AppLayout></ProtectedRoute>} />
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
            <Route path="/prompts" element={<ProtectedRoute><AppLayout><Prompts /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/llm" element={<ProtectedRoute><AppLayout><LLMSettings /></AppLayout></ProtectedRoute>} />
            <Route path="/model-governance" element={<ProtectedRoute><AppLayout><ModelGovernance /></AppLayout></ProtectedRoute>} />
            <Route path="/llm-analytics" element={<ProtectedRoute><AppLayout><LLMAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/model-management" element={<ProtectedRoute><AppLayout><ModelManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/compliance-score" element={<ProtectedRoute><AppLayout><ComplianceScore /></AppLayout></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
            <Route path="/impressum" element={<ProtectedRoute><AppLayout><Impressum /></AppLayout></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><AppLayout><ContactUs /></AppLayout></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<ProtectedRoute><AppLayout><PrivacyPolicy /></AppLayout></ProtectedRoute>} />
            <Route path="/nis2" element={<ProtectedRoute><AppLayout><NIS2Copilot /></AppLayout></ProtectedRoute>} />
            <Route path="/dora" element={<ProtectedRoute><AppLayout><DORACopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/dma" element={<ProtectedRoute><AppLayout><DMACopilot /></AppLayout></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AppLayout><AgentTasks /></AppLayout></ProtectedRoute>} />
            <Route path="/connectors" element={<ProtectedRoute><AppLayout><Connectors /></AppLayout></ProtectedRoute>} />
            <Route path="/social-sentiment" element={<ProtectedRoute><AppLayout><SocialSentiment /></AppLayout></ProtectedRoute>} />
            <Route path="/mfa-setup" element={<ProtectedRoute><MFASetup /></ProtectedRoute>} />
            <Route path="/continuous-intelligence" element={<ProtectedRoute><AppLayout><ContinuousIntelligence /></AppLayout></ProtectedRoute>} />
            <Route path="/scheduled-jobs" element={<ProtectedRoute><AppLayout><ScheduledJobs /></AppLayout></ProtectedRoute>} />
            <Route path="/feedback-analytics" element={<ProtectedRoute><AppLayout><FeedbackAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/help" element={<ProtectedRoute><AppLayout><AdminHelp /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/guide" element={<ProtectedRoute><AppLayout><AdminGuide /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/regulations" element={<ProtectedRoute><AppLayout><RegulationUploader /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/upload-policies" element={<ProtectedRoute><AppLayout><UploadPolicies /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/rag-insights" element={<ProtectedRoute><AppLayout><FeedbackAnalytics /></AppLayout></ProtectedRoute>} />
            <Route path="/risk-register" element={<ProtectedRoute><AppLayout><RiskRegister /></AppLayout></ProtectedRoute>} />
            <Route path="/dsar-queue" element={<ProtectedRoute><AppLayout><DSARQueue /></AppLayout></ProtectedRoute>} />
            <Route path="/security-center" element={<ProtectedRoute><AppLayout><SecurityCenter /></AppLayout></ProtectedRoute>} />
            <Route path="/user-guide" element={<ProtectedRoute><AppLayout><UserGuide /></AppLayout></ProtectedRoute>} />
            <Route path="/help-center" element={<ProtectedRoute><AppLayout><HelpCenter /></AppLayout></ProtectedRoute>} />
            <Route path="/regsense" element={<ProtectedRoute><AppLayout><RegSense /></AppLayout></ProtectedRoute>} />
            <Route path="/brand-comparison" element={<ProtectedRoute><BrandComparison /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AppLayout><Automation /></AppLayout></ProtectedRoute>} />
            <Route path="/audit-portal" element={<ProtectedRoute><AuditPortal /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
