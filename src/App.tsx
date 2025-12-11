import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Procurement from "./pages/Procurement";
import Shipments from "./pages/Shipments";
import Tracking from "./pages/Tracking";
import Analytics from "./pages/Analytics";
import PlaceholderPage from "./pages/PlaceholderPage";
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
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/documents" element={<PlaceholderPage title="Document Management" description="AI-powered document automation, OCR extraction, and compliance tracking coming soon." />} />
          <Route path="/invoices" element={<PlaceholderPage title="Invoice Management" description="Automated freight invoice reconciliation and cost control features coming soon." />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/risk" element={<PlaceholderPage title="Risk Monitor" description="Real-time disruption monitoring, weather alerts, and predictive risk analysis coming soon." />} />
          <Route path="/messages" element={<PlaceholderPage title="Messages" description="In-platform collaboration and communication tools coming soon." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" description="Configure your account, team, and integration settings." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
