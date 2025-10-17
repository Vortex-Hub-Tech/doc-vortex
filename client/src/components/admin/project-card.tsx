import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink } from "lucide-react";
import { type ProjectWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectWithRelations;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onView }: ProjectCardProps) {
  const getCategoryColor = (categoryName?: string) => {
    const colors: Record<string, string> = {
      "IA": "bg-blue-100 text-blue-800",
      "Automação": "bg-green-100 text-green-800", 
      "Bot": "bg-purple-100 text-purple-800",
      "Integração": "bg-orange-100 text-orange-800",
    };
    return colors[categoryName || ""] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Data não disponível";
    try {
      return `Atualizado ${formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: ptBR 
      })}`;
    } catch {
      return "Data inválida";
    }
  };

  return (
    <Card className="project-card transition-all duration-200 hover:shadow-md hover:-translate-y-1 overflow-hidden">
      {project.thumbnailUrl && (
        <img 
          src={project.thumbnailUrl} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            className={cn("text-xs font-medium", getCategoryColor(project.category?.name))}
          >
            {project.category?.name || "Sem categoria"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {project.tool?.name || "Sem ferramenta"}
          </span>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2" data-testid={`text-project-title-${project.id}`}>
          {project.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-project-description-${project.id}`}>
          {project.shortDescription}
        </p>
        
        {project.author && (
          <div className="mb-3 flex items-center text-xs text-muted-foreground" data-testid={`text-author-${project.id}`}>
            <span className="font-medium">{project.author.name}</span>
            <span className="mx-1">•</span>
            <span>{project.author.role}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground" data-testid={`text-project-updated-${project.id}`}>
            {formatDate(project.updatedAt)}
          </span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(project.id)}
              data-testid={`button-edit-project-${project.id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(project.id)}
              data-testid={`button-view-project-${project.id}`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
