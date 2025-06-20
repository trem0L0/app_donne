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
import Onboarding from "@/pages/onboarding";
import AssociationDashboard from "@/pages/association-dashboard";
import AssociationDetail from "@/pages/association-detail";
import DonationFlow from "@/pages/donation-flow";
import RegisterAssociation from "@/pages/register-association";
import DonationHistory from "@/pages/donation-history";
import QRScan from "@/pages/qr-scan";
import QRGenerator from "@/pages/qr-generator";
import Stats from "@/pages/stats";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    );
  }

  // Not authenticated - show public pages
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={Auth} />
        <Route path="/association/:id" component={AssociationDetail} />
        <Route path="/donate/:id" component={DonationFlow} />
        <Route path="/donation-flow" component={DonationFlow} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated but no user type - show onboarding
  if (!user?.userType) {
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route component={() => <Onboarding />} />
      </Switch>
    );
  }

  // Authenticated with user type - show appropriate interface
  return (
    <Switch>
      {user.userType === "association" ? (
        <>
          <Route path="/" component={AssociationDashboard} />
          <Route path="/dashboard" component={AssociationDashboard} />
          <Route path="/qr-generator" component={QRGenerator} />
          <Route path="/stats" component={Stats} />
          <Route path="/settings" component={Settings} />
          <Route path="/register" component={RegisterAssociation} />
          <Route path="/association/:id" component={AssociationDetail} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/association/:id" component={AssociationDetail} />
          <Route path="/donate/:id" component={DonationFlow} />
          <Route path="/donation-flow" component={DonationFlow} />
          <Route path="/history" component={DonationHistory} />
          <Route path="/qr-scan" component={QRScan} />
        </>
      )}
      <Route path="/auth" component={Auth} />
      <Route path="/donation-flow" component={DonationFlow} />
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
