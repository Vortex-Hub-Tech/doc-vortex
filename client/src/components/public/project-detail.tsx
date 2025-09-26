import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { type ProjectWithRelations } from "@shared/schema";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { VortexLogo } from "@/components/vortex-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface ProjectDetailProps {
  project: ProjectWithRelations;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getCategoryColor = (categoryName?: string) => {
    const colors: Record<string, string> = {
      "IA": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Automação": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
      "Bot": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Integração": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return colors[categoryName || ""] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const getIconForLink = (url: string) => {
    if (url.includes('github.com')) return '📁';
    if (url.includes('docs.') || url.includes('/docs')) return '📖';
    if (url.includes('demo') || url.includes('app.') || url.includes('live')) return '🚀';
    return '🔗';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <VortexLogo size="sm" />
              <h1 className="text-xl font-bold text-foreground" data-testid="text-project-title">
                {project.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getCategoryColor(project.category?.name)}>
                {project.category?.name || "Sem categoria"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {project.tool?.name || "Sem ferramenta"}
              </span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Hero */}
        {project.thumbnailUrl && (
          <div className="mb-8">
            <img 
              src={project.thumbnailUrl} 
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg border border-border mb-6"
              data-testid="image-hero"
            />
          </div>
        )}

        <div className="mb-8">
          <p className="text-lg text-muted-foreground" data-testid="text-description">
            {project.shortDescription}
          </p>
        </div>

        {/* Project Documentation */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <MarkdownRenderer content={project.content} />
          </CardContent>
        </Card>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Screenshots do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.images.map((image, index) => (
                  <img 
                    key={image.id}
                    src={image.url} 
                    alt={image.alt || `Screenshot ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(image.url)}
                    data-testid={`image-gallery-${index}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links and Resources */}
        {project.links && Array.isArray(project.links) && project.links.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Links e Recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.links.map((link: any, index: number) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 bg-muted hover:bg-accent rounded-lg transition-colors group"
                    data-testid={`link-${index}`}
                  >
                    <span className="text-2xl">{getIconForLink(link.url)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground group-hover:text-accent-foreground">
                        {link.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {link.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
          data-testid="image-modal"
        >
          <img 
            src={selectedImage} 
            alt="Visualização ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
