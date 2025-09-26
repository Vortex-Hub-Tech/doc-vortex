import { ProjectEditor } from "@/components/admin/project-editor";
import { useLocation, useRoute } from "wouter";

export default function ProjectEditorPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/project/:id");
  
  const projectId = params?.id === "new" ? undefined : params?.id;

  const handleBack = () => {
    setLocation("/admin");
  };

  const handleSave = () => {
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <ProjectEditor
        projectId={projectId}
        onBack={handleBack}
        onSave={handleSave}
      />
    </div>
  );
}
