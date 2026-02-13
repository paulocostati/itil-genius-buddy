import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import Practice from "./pages/Practice";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// New Pages (to be implemented)
import Catalog from "./pages/Catalog";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import PlanCheckout from "./pages/PlanCheckout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/category/:slug" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/checkout/:slug" element={<Checkout />} />
              <Route path="/plans/checkout" element={<PlanCheckout />} />
              <Route path="/account" element={<Account />} />

              {/* Legacy/Existing Routes - check if they need protection or refactoring */}
              <Route path="/exam/:examId" element={<Exam />} />
              <Route path="/result/:examId" element={<Result />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
