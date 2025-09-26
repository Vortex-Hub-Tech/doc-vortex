import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema, type Category } from "@shared/schema";
import { Plus, Edit, Trash2, Tags } from "lucide-react";
import { z } from "zod";

type CategoryFormData = z.infer<typeof insertCategorySchema>;

export function CategoriesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create/Update category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: editingCategory ? "Categoria atualizada!" : "Categoria criada!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar categoria",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Categoria excluída!",
        description: "A categoria foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    saveCategoryMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando categorias...</p>
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
            Gerenciar Categorias
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize seus projetos por categorias
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateCategory} data-testid="button-create-category">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
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
                          placeholder="Ex: IA, Automação, Bot..."
                          {...field}
                          data-testid="input-category-name"
                        />
                      </FormControl>
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
                          placeholder="Descrição da categoria..."
                          {...field}
                          data-testid="input-category-description"
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
                    disabled={saveCategoryMutation.isPending}
                    data-testid="button-save-category"
                  >
                    {saveCategoryMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-categories">
          <Tags className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece criando sua primeira categoria para organizar os projetos.
          </p>
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Categoria
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">
                    {category.name}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-foreground mb-2" data-testid={`text-category-name-${category.id}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-category-description-${category.id}`}>
                    {category.description}
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