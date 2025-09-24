import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import FeaturesPage from './pages/pre-login/features';
import PricingPage from './pages/pre-login/pricing';
import FaqPage from './pages/pre-login/faq';
import PrivacyPolicyPage from './pages/pre-login/privacypolicy';
import RefundPolicyPage from './pages/pre-login/refundpolicy';
import TermsOfServicePage from './pages/pre-login/termsofservice';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
          <Route path="/refundpolicy" element={<RefundPolicyPage />} />
          <Route path="/termsofservice" element={<TermsOfServicePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
