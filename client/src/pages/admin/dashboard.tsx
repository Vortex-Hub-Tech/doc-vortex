import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/admin/sidebar";
import { ProjectCard } from "@/components/admin/project-card";
import { CategoriesManagement } from "@/components/admin/categories-management";
import { ToolsManagement } from "@/components/admin/tools-management";
import { Settings } from "@/components/admin/settings";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type ProjectWithRelations } from "@shared/schema";
import { Plus, FolderOpen } from "lucide-react";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("projects");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<ProjectWithRelations[]>({
    queryKey: ["/api/projects"],
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      // Invalidate auth cache to prevent stale data
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      setLocation("/login");
    },
    onError: () => {
      // Even if logout fails on server, clear cache and redirect to login
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateProject = () => {
    setLocation("/admin/project/new");
  };

  const handleEditProject = (id: string) => {
    setLocation(`/admin/project/${id}`);
  };

  const handleViewProject = (id: string) => {
    // Open project in new tab for public view
    const project = projects.find(p => p.id === id);
    if (project) {
      window.open(`/project/${project.slug}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {activeSection === "projects" && (
          <>
            {/* Header */}
            <header className="bg-card border-b border-border shadow-sm">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Gerenciar Projetos
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Organize e documente seus projetos
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateProject}
                    data-testid="button-create-project"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                </div>
              </div>
            </header>

            {/* Projects Grid */}
            <main className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-state">
                  <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum projeto encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Comece criando seu primeiro projeto de documentação.
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={handleEditProject}
                      onView={handleViewProject}
                    />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {activeSection === "categories" && (
          <main className="p-6">
            <CategoriesManagement />
          </main>
        )}

        {activeSection === "tools" && (
          <main className="p-6">
            <ToolsManagement />
          </main>
        )}

        {activeSection === "settings" && (
          <main className="p-6">
            <Settings />
          </main>
        )}
      </div>
    </div>
  );
}
