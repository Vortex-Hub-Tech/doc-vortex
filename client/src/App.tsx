import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";

// Pages
import PublicProjectsPage from "@/pages/public/projects";
import ProjectDetailPage from "@/pages/public/project-detail";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ProjectEditorPage from "@/pages/admin/project-editor";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      
      {/* Protected routes - require authentication */}
      <Route path="/">
        {() => <ProtectedRoute component={PublicProjectsPage} />}
      </Route>
      <Route path="/project/:slug">
        {(params) => <ProtectedRoute component={ProjectDetailPage} {...params} />}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/project/:id">
        {(params) => <ProtectedRoute component={ProjectEditorPage} {...params} />}
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vortex-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
