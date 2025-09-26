import logoImage from "@assets/468512062_1011071840777526_8774782408988115845_n_1754505856480-__KlJJsj (1)_1758909244176.jpg";

interface VortexLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VortexLogo({ size = "md", className = "" }: VortexLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-16 w-16"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`} data-testid="vortex-logo">
      <img 
        src={logoImage}
        alt="VortexHub Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      <div className="flex flex-col">
        <span className="font-bold text-primary text-lg leading-tight">VORTEX</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">GESTÃO</span>
      </div>
    </div>
  );
}