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
import Auth from "@/pages/auth";
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
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
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
      <div className="mobile-container">
        {isAuthenticated && <MobileHeader />}
        <main className={`pb-24 ${isAuthenticated ? '' : 'pt-0'}`}>
          <Router />
        </main>
        <NavigationTabs />
      </div>
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
