import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Procurement from "./pages/Procurement";
import Shipments from "./pages/Shipments";
import Tracking from "./pages/Tracking";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Documents from "./pages/Documents";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VendorPortal from "./pages/VendorPortal";
import VendorRfqDetail from "./pages/VendorRfqDetail";

// Website Pages
import WebsiteHome from "./pages/website/WebsiteHome";
import PlatformOverview from "./pages/website/PlatformOverview";
import SolutionDetail from "./pages/website/SolutionDetail";
import HowItWorks from "./pages/website/HowItWorks";
import DemoRequest from "./pages/website/DemoRequest";
import BlogListing from "./pages/website/BlogListing";
import BlogPost from "./pages/website/BlogPost";
import About from "./pages/website/About";
import Careers from "./pages/website/Careers";
import Contact from "./pages/website/Contact";
import Resources from "./pages/website/Resources";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Marketing Website */}
          <Route path="/website" element={<WebsiteHome />} />
          <Route path="/website/platform" element={<PlatformOverview />} />
          <Route path="/website/solutions/:slug" element={<SolutionDetail />} />
          <Route path="/website/how-it-works" element={<HowItWorks />} />
          <Route path="/website/demo" element={<DemoRequest />} />
          <Route path="/website/blog" element={<BlogListing />} />
          <Route path="/website/blog/:slug" element={<BlogPost />} />
          <Route path="/website/about" element={<About />} />
          <Route path="/website/careers" element={<Careers />} />
          <Route path="/website/contact" element={<Contact />} />
          <Route path="/website/resources" element={<Resources />} />

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Vendor Portal */}
          <Route path="/vendor" element={<VendorPortal />} />
          <Route path="/vendor/rfq/:rfqId" element={<VendorRfqDetail />} />
          
          {/* Buyer Portal */}
          <Route path="/" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/invoices" element={<Invoices />} />
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
