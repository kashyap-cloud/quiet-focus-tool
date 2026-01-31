import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AttentionSwitch from "./pages/activities/AttentionSwitch";
import DoNothing from "./pages/activities/DoNothing";
import LabelTheNoise from "./pages/activities/LabelTheNoise";
import CompulsionPicker from "./pages/activities/CompulsionPicker";
import EndTheLoop from "./pages/activities/EndTheLoop";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activity/attention-switch" element={<AttentionSwitch />} />
          <Route path="/activity/do-nothing" element={<DoNothing />} />
          <Route path="/activity/label-the-noise" element={<LabelTheNoise />} />
          <Route path="/activity/compulsion-picker" element={<CompulsionPicker />} />
          <Route path="/activity/end-the-loop" element={<EndTheLoop />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
