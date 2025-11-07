import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

import Home from "@/pages/Home";
import About from "@/pages/About";
import HowItWorks from "@/pages/HowItWorks";
import Pricing from "@/pages/Pricing";
import EnergyZone from "@/pages/EnergyZone";
import Demo from "@/pages/Demo";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Recommendations from "@/pages/Recommendations";
import Reports from "@/pages/Reports";
import Summary from "@/pages/Summary";
import Integrations from "@/pages/Integrations";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [location] = useLocation();
  const isAuthRoute = location.startsWith("/app/");

  if (isAuthRoute) {
    return (
      <AuthenticatedLayout>
        <Switch>
          <Route path="/app/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/app/recommendations">
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          </Route>
          <Route path="/app/reports">
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          </Route>
          <Route path="/app/summary">
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          </Route>
          <Route path="/app/integrations">
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          </Route>
          <Route path="/app/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </AuthenticatedLayout>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/energy-zone" component={EnergyZone} />
          <Route path="/demo" component={Demo} />
          <Route path="/login" component={Login} />

          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
