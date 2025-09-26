import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Database, 
  Users, 
  FolderOpen, 
  Tags, 
  Wrench,
  Download,
  Upload,
  Info
} from "lucide-react";
import { type ProjectWithRelations, type Category, type Tool } from "@shared/schema";

export function Settings() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data for statistics
  const { data: projects = [] } = useQuery<ProjectWithRelations[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const publishedProjects = projects.filter(p => p.status === "published");
  const draftProjects = projects.filter(p => p.status === "draft");

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        projects: projects,
        categories: categories,
        tools: tools,
        statistics: {
          totalProjects: projects.length,
          publishedProjects: publishedProjects.length,
          draftProjects: draftProjects.length,
          totalCategories: categories.length,
          totalTools: tools.length,
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup exportado!",
        description: "Os dados foram exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no export",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Dados importados:', data);
            toast({
              title: "Dados analisados",
              description: "Verifique o console para os dados importados. Funcionalidade de importação será implementada em versão futura.",
            });
          } catch (error) {
            toast({
              title: "Erro no import",
              description: "Arquivo JSON inválido.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Configurações do Sistema
        </h2>
        <p className="text-sm text-muted-foreground">
          Estatísticas, backup e configurações gerais
        </p>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Estatísticas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
                <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projetos Total</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
                <FolderOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{publishedProjects.length}</div>
              <div className="text-sm text-muted-foreground">Publicados</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-2">
                <FolderOpen className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{draftProjects.length}</div>
              <div className="text-sm text-muted-foreground">Rascunhos</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-2">
                <Tags className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mx-auto mb-2">
                <Wrench className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{tools.length}</div>
              <div className="text-sm text-muted-foreground">Ferramentas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Backup e Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Exportar Dados</h3>
              <p className="text-sm text-muted-foreground">
                Faça backup de todos os projetos, categorias e ferramentas
              </p>
            </div>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              data-testid="button-export-data"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium text-foreground">Importar Dados</h3>
              <p className="text-sm text-muted-foreground">
                Restaurar dados de um arquivo de backup (JSON)
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleImportData}
              data-testid="button-import-data"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Versão:</span>
                <Badge variant="secondary">1.0.0</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ambiente:</span>
                <Badge variant="secondary">Desenvolvimento</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Banco de Dados:</span>
                <Badge className="bg-green-100 text-green-800">PostgreSQL</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Storage:</span>
                <Badge className="bg-blue-100 text-blue-800">Supabase</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Autenticação:</span>
                <Badge className="bg-purple-100 text-purple-800">Sessions</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Frontend:</span>
                <Badge className="bg-cyan-100 text-cyan-800">React + Vite</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.length === 0 && (
              <div className="p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Criar Categorias
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Você ainda não possui categorias. Organize seus projetos criando algumas.
                </p>
              </div>
            )}

            {tools.length === 0 && (
              <div className="p-4 border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Adicionar Ferramentas
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cadastre as tecnologias e ferramentas que você utiliza nos projetos.
                </p>
              </div>
            )}

            {projects.length === 0 && (
              <div className="p-4 border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Primeiro Projeto
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Comece documentando seu primeiro projeto para criar seu portfólio.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}