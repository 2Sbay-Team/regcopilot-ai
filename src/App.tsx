import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai-act" element={<ProtectedRoute><AIActCopilot /></ProtectedRoute>} />
            <Route path="/gdpr" element={<ProtectedRoute><GDPRCopilot /></ProtectedRoute>} />
            <Route path="/esg" element={<ProtectedRoute><ESGCopilot /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
            <Route path="/models" element={<ProtectedRoute><ModelRegistry /></ProtectedRoute>} />
            <Route path="/explainability" element={<ProtectedRoute><Explainability /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/rag-search" element={<ProtectedRoute><RAGSearch /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><SystemSetup /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
