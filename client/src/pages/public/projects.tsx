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
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch public projects
  const { data: projects = [], isLoading } = useQuery<ProjectWithRelations[]>({
    queryKey: ["/api/projects/public"],
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch all tools
  const { data: allTools = [] } = useQuery({
    queryKey: ["/api/tools"],
  });

  const handleProjectClick = (slug: string) => {
    setLocation(`/project/${slug}`);
  };

  const handleLogin = () => {
    setLocation("/admin");
  };

  // Get tools available in the selected category
  const availableTools = selectedCategory
    ? allTools.filter((tool: any) => 
        projects.some(
          (project) => 
            project.categoryId === selectedCategory && 
            project.toolId === tool.id
        )
      )
    : [];

  // Reset tool filter when category changes
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedTool(null);
  };

  // Filter projects by category and tool
  const filteredProjects = projects.filter((project) => {
    const categoryMatch = selectedCategory
      ? project.categoryId === selectedCategory
      : true;
    const toolMatch = selectedTool
      ? project.toolId === selectedTool
      : true;
    return categoryMatch && toolMatch;
  });

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
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Categorias
                </p>
                <div className="flex space-x-4 overflow-x-auto">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(null)}
                    className="whitespace-nowrap"
                    data-testid="button-filter-all"
                  >
                    Todos
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className="whitespace-nowrap"
                      data-testid={`button-filter-${category.slug}`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tools Filter - Only shows when a category is selected */}
              {selectedCategory && availableTools.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Ferramentas
                  </p>
                  <div className="flex space-x-4 overflow-x-auto">
                    <Button
                      variant={selectedTool === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTool(null)}
                      className="whitespace-nowrap"
                      data-testid="button-filter-all-tools"
                    >
                      Todas
                    </Button>
                    {availableTools.map((tool: any) => (
                      <Button
                        key={tool.id}
                        variant={
                          selectedTool === tool.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedTool(tool.id)}
                        className="whitespace-nowrap"
                        data-testid={`button-filter-tool-${tool.slug}`}
                      >
                        {tool.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
