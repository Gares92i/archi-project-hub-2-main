
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectHeaderProps {
  id: string;
  isSaving: boolean;
  onSave: () => void;
}

export const ProjectHeader = ({ id, isSaving, onSave }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Modifier le projet</h1>
      </div>
      <Button 
        onClick={onSave} 
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
};
