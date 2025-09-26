import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "./markdown-renderer";
import { 
  Bold, 
  Italic, 
  Heading, 
  List, 
  ListOrdered, 
  Link, 
  Code, 
  Eye, 
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const insertText = (before: string, after = "", placeholder = "texto") => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarItems = [
    {
      icon: Bold,
      title: "Negrito",
      onClick: () => insertText("**", "**", "texto em negrito"),
    },
    {
      icon: Italic,
      title: "Itálico",
      onClick: () => insertText("*", "*", "texto em itálico"),
    },
    {
      icon: Heading,
      title: "Título",
      onClick: () => insertText("## ", "", "Título"),
    },
    {
      type: "separator",
    },
    {
      icon: List,
      title: "Lista",
      onClick: () => insertText("- ", "", "item da lista"),
    },
    {
      icon: ListOrdered,
      title: "Lista Numerada",
      onClick: () => insertText("1. ", "", "item numerado"),
    },
    {
      icon: Link,
      title: "Link",
      onClick: () => insertText("[", "](https://exemplo.com)", "texto do link"),
    },
    {
      icon: Code,
      title: "Código",
      onClick: () => insertText("`", "`", "código"),
    },
  ];

  type ToolbarItem = {
    icon: any;
    title: string;
    onClick: () => void;
  } | {
    type: "separator";
  };

  const defaultContent = `# Como criar este projeto

## Pré-requisitos
- Liste os requisitos necessários
- Ferramentas e dependências

## Passo a passo
1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute os comandos de instalação

## Como usar
Descreva como utilizar o projeto...

## Manutenção
Como manter e atualizar o projeto...`;

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
        <div className="flex items-center space-x-2">
          {toolbarItems.map((item: ToolbarItem, index) => {
            if ("type" in item && item.type === "separator") {
              return <Separator key={index} orientation="vertical" className="h-6" />;
            }

            if ("icon" in item) {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  title={item.title}
                  data-testid={`button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            }
            return null;
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={mode === "edit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("edit")}
            data-testid="button-edit-mode"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant={mode === "preview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("preview")}
            data-testid="button-preview-mode"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {mode === "edit" ? (
          <Textarea
            data-markdown-editor
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={defaultContent}
            className="min-h-[300px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
            data-testid="textarea-markdown"
          />
        ) : (
          <div className="p-4">
            <MarkdownRenderer content={value || defaultContent} />
          </div>
        )}
      </div>
    </div>
  );
}
