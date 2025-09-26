import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-gray max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        components={{
          // Custom styling for code blocks
          code({ inline, className, children, ...props }: any) {
            return inline ? (
              <code
                className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={cn("block bg-muted p-4 rounded text-sm font-mono overflow-x-auto", className)}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Custom styling for headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mb-6 mt-8 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-foreground mb-4 mt-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mb-3 mt-5">
              {children}
            </h3>
          ),
          // Custom styling for paragraphs
          p: ({ children }) => (
            <p className="text-muted-foreground mb-4 leading-7">
              {children}
            </p>
          ),
          // Custom styling for lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 text-muted-foreground space-y-2">
              {children}
            </ol>
          ),
          // Custom styling for links
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // Custom styling for blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-6">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
