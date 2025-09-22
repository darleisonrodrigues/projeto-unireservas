import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { AuthFirebaseProvider } from "@/contexts/AuthFirebaseContext";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthFirebaseProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PropertyProvider>
      </AuthFirebaseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
