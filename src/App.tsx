import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AttentionSwitch from "./pages/activities/AttentionSwitch";
import DoNothing from "./pages/activities/DoNothing";
import LabelTheNoise from "./pages/activities/LabelTheNoise";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/calm_space">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activity/attention-switch" element={<AttentionSwitch />} />
            <Route path="/activity/do-nothing" element={<DoNothing />} />
            <Route path="/activity/label-the-noise" element={<LabelTheNoise />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
