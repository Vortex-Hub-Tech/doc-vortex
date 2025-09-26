import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ProjectDetail } from "@/components/public/project-detail";
import { type ProjectWithRelations } from "@shared/schema";

export default function ProjectDetailPage() {
  const [, params] = useRoute("/project/:slug");
  const [, setLocation] = useLocation();
  
  const slug = params?.slug;

  // Fetch project by slug
  const { data: project, isLoading, error } = useQuery<ProjectWithRelations>({
    queryKey: ["/api/projects/slug", slug],
    enabled: !!slug,
  });

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Projeto não encontrado</h1>
          <p className="text-muted-foreground mb-4">
            O projeto que você está procurando não existe ou não está mais disponível.
          </p>
          <button
            onClick={handleBack}
            className="text-primary hover:text-primary/80 underline"
          >
            Voltar aos projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectDetail
      project={project}
      onBack={handleBack}
    />
  );
}
