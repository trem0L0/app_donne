import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileHeader } from "@/components/layout/mobile-header";
import { NavigationTabs } from "@/components/layout/navigation-tabs";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import AssociationDetail from "@/pages/association-detail";
import DonationFlow from "@/pages/donation-flow";
import RegisterAssociation from "@/pages/register-association";
import DonationHistory from "@/pages/donation-history";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/association/:id" component={AssociationDetail} />
          <Route path="/donate/:id" component={DonationFlow} />
          <Route path="/register" component={RegisterAssociation} />
          <Route path="/history" component={DonationHistory} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <TooltipProvider>
      {isLoading || !isAuthenticated ? (
        <Router />
      ) : (
        <div className="mobile-container">
          <MobileHeader />
          <NavigationTabs />
          <main className="pb-20">
            <Router />
          </main>
          
          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <button className="w-14 h-14 bg-accent text-black rounded-full shadow-lg flex items-center justify-center hover:bg-accent/90 transition-all hover:scale-105">
              <Heart size={20} />
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
