import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Tags, Wrench, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { VortexLogo } from "@/components/vortex-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "projects", label: "Projetos", icon: FolderOpen },
    { id: "categories", label: "Categorias", icon: Tags },
    { id: "tools", label: "Ferramentas", icon: Wrench },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <VortexLogo size="sm" />
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-medium",
                  activeSection === item.id && "bg-accent text-accent-foreground"
                )}
                onClick={() => onSectionChange(item.id)}
                data-testid={`button-menu-${item.id}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
