import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/public/project-grid";
import { type ProjectWithRelations, type Category } from "@shared/schema";
import { useLocation } from "wouter";
import { LogIn } from "lucide-react";
import { VortexLogo } from "@/components/vortex-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function PublicProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch public projects
  const { data: projects = [], isLoading } = useQuery<ProjectWithRelations[]>({
    queryKey: ["/api/projects/public"],
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleProjectClick = (slug: string) => {
    setLocation(`/project/${slug}`);
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  // Filter projects by category
  const filteredProjects = selectedCategory
    ? projects.filter(project => project.categoryId === selectedCategory)
    : projects;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <VortexLogo size="md" />
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              <Button 
                variant="ghost"
                onClick={handleLogin}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
                data-testid="button-filter-all"
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                  data-testid={`button-filter-${category.slug}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectGrid
          projects={filteredProjects}
          onProjectClick={handleProjectClick}
        />
      </main>
    </div>
  );
}
