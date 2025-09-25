import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import PageNotFound from "./pages/PageNotFound";
import AuthPage from "./pages/auth/Auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import NewProject from "./pages/projects/NewProject";
import ProjectDetail from "./pages/projects/ProjectDetail";
import Clients from "./pages/clients/Clients";
import Checklists from "./pages/checklists/Checklists";
import Notes from "./pages/notes/Notes";
import Chatbot from "./pages/chatbot/Chatbot";
import Exports from "./pages/exports/Exports";
import Settings from "./pages/settings/Settings";
import FeaturesPage from './pages/pre-login/features';
import PricingPage from './pages/pre-login/Pricing';
import FaqPage from './pages/pre-login/Faq';
import PrivacyPolicyPage from './pages/pre-login/Privacypolicy';
import RefundPolicyPage from './pages/pre-login/Refundpolicy';
import TermsOfServicePage from './pages/pre-login/Termsofservice';
import OnboardingCustomize from './pages/onboarding/OnboardingCustomize';
import Profile from './pages/profile/Profile';

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
            
            {/* Onboarding routes */}
            <Route path="/onboarding/customize" element={<OnboardingCustomize />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/projects" element={<AppLayout />}>
              <Route index element={<Projects />} />
              <Route path="new" element={<NewProject />} />
              <Route path=":id" element={<ProjectDetail />} />
              <Route path=":id/edit" element={<NewProject />} />
            </Route>
            <Route path="/clients" element={<AppLayout />}>
              <Route index element={<Clients />} />
              <Route path="new" element={<Clients />} />
            </Route>
            <Route path="/checklists" element={<AppLayout />}>
              <Route index element={<Checklists />} />
            </Route>
            <Route path="/notes" element={<AppLayout />}>
              <Route index element={<Notes />} />
            </Route>
            <Route path="/chatbot" element={<AppLayout />}>
              <Route index element={<Chatbot />} />
            </Route>
            <Route path="/exports" element={<AppLayout />}>
              <Route index element={<Exports />} />
            </Route>
            <Route path="/settings" element={<AppLayout />}>
              <Route index element={<Settings />} />
            </Route>
            <Route path="/profile" element={<AppLayout />}>
              <Route index element={<Profile />} />
            </Route>
            <Route path="/help" element={<AppLayout />}>
              <Route index element={<div className="p-6">Help - Coming Soon</div>} />
            </Route>
            
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
