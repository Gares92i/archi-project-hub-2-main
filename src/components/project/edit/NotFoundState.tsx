
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export const NotFoundState = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="flex flex-col items-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <p className="text-xl font-medium mb-4">Projet non trouvé</p>
        <p className="text-muted-foreground mb-6">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate("/projects")}>Retour à la liste des projets</Button>
      </div>
    </MainLayout>
  );
};
