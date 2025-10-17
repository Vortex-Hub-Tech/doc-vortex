import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ProjectWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

interface ProjectGridProps {
  projects: ProjectWithRelations[];
  onProjectClick: (slug: string) => void;
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  const getCategoryColor = (categoryName?: string) => {
    const colors: Record<string, string> = {
      "IA": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Automação": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
      "Bot": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Integração": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[categoryName || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Data não disponível";
    try {
      return `Publicado ${formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: ptBR 
      })}`;
    } catch {
      return "Data inválida";
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <div className="text-muted-foreground mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum projeto encontrado
        </h3>
        <p className="text-muted-foreground">
          Não há projetos publicados no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <Card 
          key={project.id}
          className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          onClick={() => onProjectClick(project.slug)}
          data-testid={`card-project-${project.id}`}
        >
          {project.thumbnailUrl && (
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-48 object-cover"
            />
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Badge className={getCategoryColor(project.category?.name)}>
                {project.category?.name || "Sem categoria"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {project.tool?.name || "Sem ferramenta"}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-title-${project.id}`}>
              {project.title}
            </h2>
            
            <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`text-description-${project.id}`}>
              {project.shortDescription}
            </p>
            
            {project.author && (
              <div className="flex items-center text-sm text-muted-foreground mb-3" data-testid={`text-author-${project.id}`}>
                <span className="font-medium">{project.author.name}</span>
                <span className="mx-1">•</span>
                <span>{project.author.role}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground" data-testid={`text-date-${project.id}`}>
                {formatDate(project.createdAt)}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
