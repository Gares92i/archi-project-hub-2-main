
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourceSearchBar } from "@/components/resources/ResourceSearchBar";
import { ResourceCategories } from "@/components/resources/ResourceCategories";
import { resources } from "@/components/resources/data";

const Resources = () => {
  const [isResourceSheetOpen, setIsResourceSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleAddResource = () => {
    toast({
      title: "Ressource ajoutée",
      description: "La nouvelle ressource a été ajoutée avec succès"
    });
    setIsResourceSheetOpen(false);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Ressources</h1>
            <p className="text-muted-foreground">
              Consultez et téléchargez les ressources partagées
            </p>
          </div>
          <Button onClick={() => setIsResourceSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ressource
          </Button>
        </div>
      </div>

      <ResourceSearchBar />
      <ResourceCategories resources={resources} />
      <ResourceForm 
        isOpen={isResourceSheetOpen} 
        onOpenChange={setIsResourceSheetOpen} 
        onAddResource={handleAddResource} 
      />
    </MainLayout>
  );
};

export default Resources;
