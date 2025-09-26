import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertToolSchema, type Tool, type Category } from "@shared/schema";
import { Plus, Edit, Trash2, Wrench } from "lucide-react";
import { z } from "zod";

type ToolFormData = z.infer<typeof insertToolSchema>;

export function ToolsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ToolFormData>({
    resolver: zodResolver(insertToolSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
    },
  });

  // Fetch tools and categories
  const { data: tools = [], isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create/Update tool mutation
  const saveToolMutation = useMutation({
    mutationFn: async (data: ToolFormData) => {
      const url = editingTool ? `/api/tools/${editingTool.id}` : "/api/tools";
      const method = editingTool ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: editingTool ? "Ferramenta atualizada!" : "Ferramenta criada!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      setIsDialogOpen(false);
      setEditingTool(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar ferramenta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Delete tool mutation
  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return await apiRequest("DELETE", `/api/tools/${toolId}`);
    },
    onSuccess: () => {
      toast({
        title: "Ferramenta excluída!",
        description: "A ferramenta foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir ferramenta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleCreateTool = () => {
    setEditingTool(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    form.reset({
      name: tool.name,
      description: tool.description || "",
      categoryId: tool.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTool = (toolId: string) => {
    if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
      deleteToolMutation.mutate(toolId);
    }
  };

  const onSubmit = (data: ToolFormData) => {
    saveToolMutation.mutate(data);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const getCategoryColor = (categoryId: string) => {
    const categoryName = getCategoryName(categoryId);
    const colors: Record<string, string> = {
      "IA": "bg-blue-100 text-blue-800",
      "Automação": "bg-green-100 text-green-800", 
      "Bot": "bg-purple-100 text-purple-800",
      "Integração": "bg-orange-100 text-orange-800",
    };
    return colors[categoryName] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ferramentas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Gerenciar Ferramentas
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize as tecnologias e ferramentas utilizadas nos projetos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateTool} data-testid="button-create-tool">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Python, OpenAI, PostgreSQL..."
                          {...field}
                          data-testid="input-tool-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tool-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descrição da ferramenta..."
                          {...field}
                          data-testid="input-tool-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveToolMutation.isPending}
                    data-testid="button-save-tool"
                  >
                    {saveToolMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-tools">
          <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma ferramenta encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece criando sua primeira ferramenta para categorizar as tecnologias.
          </p>
          <Button onClick={handleCreateTool}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Ferramenta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(tool.categoryId)}>
                    {getCategoryName(tool.categoryId)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTool(tool)}
                      data-testid={`button-edit-tool-${tool.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTool(tool.id)}
                      data-testid={`button-delete-tool-${tool.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-foreground mb-2" data-testid={`text-tool-name-${tool.id}`}>
                  {tool.name}
                </h3>
                {tool.description && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-tool-description-${tool.id}`}>
                    {tool.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}