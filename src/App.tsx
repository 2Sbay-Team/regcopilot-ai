import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AIActCopilot from "./pages/AIActCopilot";
import GDPRCopilot from "./pages/GDPRCopilot";
import ESGCopilot from "./pages/ESGCopilot";
import AuditTrail from "./pages/AuditTrail";
import ModelRegistry from "./pages/ModelRegistry";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-act" element={<AIActCopilot />} />
          <Route path="/gdpr" element={<GDPRCopilot />} />
          <Route path="/esg" element={<ESGCopilot />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/models" element={<ModelRegistry />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
