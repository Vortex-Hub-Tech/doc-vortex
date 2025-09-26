import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema, type ProjectWithRelations, type Category, type Tool } from "@shared/schema";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

const projectFormSchema = insertProjectSchema.extend({
  links: z.array(z.object({
    title: z.string().min(1, "Título é obrigatório"),
    url: z.string().url("URL inválida"),
  })).default([]),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectEditorProps {
  projectId?: string;
  onBack: () => void;
  onSave?: (project: ProjectWithRelations) => void;
}

export function ProjectEditor({ projectId, onBack, onSave }: ProjectEditorProps) {
  const [isEditMode] = useState(!!projectId);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      content: "",
      categoryId: "",
      toolId: "",
      status: "draft",
      links: [],
      thumbnailUrl: "",
    },
  });

  // Fetch existing project for edit mode
  const { data: project, isLoading: projectLoading } = useQuery<ProjectWithRelations>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Fetch categories and tools
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  // Populate form with existing project data
  useEffect(() => {
    if (project && isEditMode) {
      form.reset({
        title: project.title || "",
        shortDescription: project.shortDescription || "",
        content: project.content || "",
        categoryId: project.categoryId || "",
        toolId: project.toolId || "",
        status: project.status || "draft",
        links: (project.links as any[]) || [],
        thumbnailUrl: project.thumbnailUrl || "",
      });
      setLinks((project.links as any[]) || []);
    }
  }, [project, isEditMode, form]);

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const url = isEditMode ? `/api/projects/${projectId}` : "/api/projects";
      const method = isEditMode ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: (savedProject) => {
      toast({
        title: isEditMode ? "Projeto atualizado!" : "Projeto criado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (onSave) {
        onSave(savedProject);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar projeto",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    const formData = {
      ...data,
      links: links,
    };
    saveProjectMutation.mutate(formData);
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks([...links, newLink]);
      setNewLink({ title: "", url: "" });
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  if (projectLoading) {
    return <div className="ml-64 flex-1 p-6">Carregando...</div>;
  }

  return (
    <div className="ml-64 flex-1">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isEditMode ? "Editar Projeto" : "Novo Projeto"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Documente seu projeto com detalhes
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => form.setValue("status", "draft")}
                data-testid="button-save-draft"
              >
                Rascunho
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={saveProjectMutation.isPending}
                data-testid="button-publish"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveProjectMutation.isPending ? "Salvando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Projeto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Gerador de Conteúdo IA"
                              {...field}
                              data-testid="input-project-title"
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
                              <SelectTrigger data-testid="select-category">
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
                      name="toolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ferramenta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tool">
                                <SelectValue placeholder="Selecione uma ferramenta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tools.map((tool) => (
                                <SelectItem key={tool.id} value={tool.id}>
                                  {tool.name}
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="published">Publicado</SelectItem>
                              <SelectItem value="archived">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Curta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva brevemente o que este projeto faz..."
                            rows={3}
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Image Upload */}
              <ImageUpload
                projectId={projectId}
                onThumbnailChange={(url) => form.setValue("thumbnailUrl", url)}
                currentThumbnail={form.watch("thumbnailUrl") || ""}
              />

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentação</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MarkdownEditor
                            value={field.value}
                            onChange={field.onChange}
                            data-testid="markdown-editor"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Links and Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Links e Recursos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Label htmlFor="link-title">Título do Link</Label>
                      <Input
                        id="link-title"
                        placeholder="Ex: Repositório GitHub"
                        value={newLink.title}
                        onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                        data-testid="input-link-title"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="link-url">URL</Label>
                      <Input
                        id="link-url"
                        type="url"
                        placeholder="https://github.com/..."
                        value={newLink.url}
                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                        data-testid="input-link-url"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={addLink}
                        data-testid="button-add-link"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                        data-testid={`link-item-${index}`}
                      >
                        <div>
                          <p className="font-medium text-foreground">{link.title}</p>
                          <p className="text-sm text-muted-foreground">{link.url}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLink(index)}
                          data-testid={`button-remove-link-${index}`}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
