import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabaseStorage } from "@/lib/supabase";
import { Upload, X, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  projectId?: string;
  onThumbnailChange: (url: string) => void;
  currentThumbnail?: string;
}

interface UploadedImage {
  id: string;
  url: string;
  alt: string;
}

export function ImageUpload({ projectId, onThumbnailChange, currentThumbnail }: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const bucket = "project-images";
        
        try {
          const url = await supabaseStorage.uploadFile(bucket, fileName, file);
          return {
            id: fileName,
            url,
            alt: file.name,
          };
        } catch (error) {
          console.error(`Erro ao fazer upload de ${file.name}:`, error);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer upload de ${file.name}`,
            variant: "destructive",
          });
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result): result is UploadedImage => result !== null);
      
      setUploadedImages(prev => [...prev, ...successfulUploads]);
      
      // Set first image as thumbnail if none exists
      if (successfulUploads.length > 0 && !currentThumbnail) {
        onThumbnailChange(successfulUploads[0].url);
      }

      toast({
        title: "Upload concluído!",
        description: `${successfulUploads.length} imagem(ns) enviada(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado durante o upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [currentThumbnail, onThumbnailChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract path from URL for Supabase Storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabaseStorage.deleteFile("project-images", fileName);
      
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      
      // Clear thumbnail if it was the removed image
      if (currentThumbnail === imageUrl) {
        onThumbnailChange("");
      }
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover imagem",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const setAsThumbnail = (url: string) => {
    onThumbnailChange(url);
    toast({
      title: "Thumbnail atualizada",
      description: "A imagem foi definida como thumbnail do projeto.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagens do Projeto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-border bg-muted",
            isUploading && "pointer-events-none opacity-50"
          )}
          data-testid="image-upload-zone"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">
            {isDragActive ? "Solte as imagens aqui" : "Arraste imagens aqui ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG até 10MB cada
          </p>
          {isUploading && (
            <p className="text-sm text-primary mt-2">Fazendo upload...</p>
          )}
        </div>

        {/* Image Gallery */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="relative group"
                data-testid={`image-item-${image.id}`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className={cn(
                    "w-full h-32 object-cover rounded-md border",
                    currentThumbnail === image.url ? "border-primary border-2" : "border-border"
                  )}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAsThumbnail(image.url)}
                    data-testid={`button-set-thumbnail-${image.id}`}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id, image.url)}
                    data-testid={`button-remove-image-${image.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {currentThumbnail === image.url && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Thumbnail
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
