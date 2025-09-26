import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import PublicProjectsPage from "@/pages/public/projects";
import ProjectDetailPage from "@/pages/public/project-detail";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ProjectEditorPage from "@/pages/admin/project-editor";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={PublicProjectsPage} />
      <Route path="/project/:slug" component={ProjectDetailPage} />
      
      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/project/:id" component={ProjectEditorPage} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
