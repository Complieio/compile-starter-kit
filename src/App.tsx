import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/Auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import FeaturesPage from './pages/pre-login/features';
import PricingPage from './pages/pre-login/Pricing';
import FaqPage from './pages/pre-login/Faq';
import PrivacyPolicyPage from './pages/pre-login/Privacypolicy';
import RefundPolicyPage from './pages/pre-login/Refundpolicy';
import TermsOfServicePage from './pages/pre-login/Termsofservice';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
            <Route path="/refundpolicy" element={<RefundPolicyPage />} />
            <Route path="/termsofservice" element={<TermsOfServicePage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/projects" element={<AppLayout />}>
              <Route index element={<div className="p-6">Projects - Coming Soon</div>} />
            </Route>
            <Route path="/clients" element={<AppLayout />}>
              <Route index element={<div className="p-6">Clients - Coming Soon</div>} />
            </Route>
            <Route path="/checklists" element={<AppLayout />}>
              <Route index element={<div className="p-6">Checklists - Coming Soon</div>} />
            </Route>
            <Route path="/notes" element={<AppLayout />}>
              <Route index element={<div className="p-6">Notes - Coming Soon</div>} />
            </Route>
            <Route path="/chatbot" element={<AppLayout />}>
              <Route index element={<div className="p-6">Chatbot - Coming Soon</div>} />
            </Route>
            <Route path="/exports" element={<AppLayout />}>
              <Route index element={<div className="p-6">Exports - Coming Soon</div>} />
            </Route>
            <Route path="/settings" element={<AppLayout />}>
              <Route index element={<div className="p-6">Settings - Coming Soon</div>} />
            </Route>
            <Route path="/help" element={<AppLayout />}>
              <Route index element={<div className="p-6">Help - Coming Soon</div>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
