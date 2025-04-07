import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, Upload } from "lucide-react";
import { Recommendation } from "@/components/services/types";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface SortableRecommendationItemProps {
  recommendation: Recommendation;
  updateRecommendation: (id: string, data: Partial<Recommendation>) => void;
  removeRecommendation: (id: string) => void;
}

export const SortableRecommendationItem = ({ 
  recommendation, 
  updateRecommendation, 
  removeRecommendation 
}: SortableRecommendationItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: recommendation.id });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    opacity: isDragging ? 0.8 : 1,
  };
  
  // Fonction pour gérer le clic sur le bouton "Ajouter photo"
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Fonction pour gérer le téléchargement de fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    
    setIsUploading(true);
    const loadingToast = toast.loading(`Téléchargement de ${file.name} en cours...`);
    
    try {
      // Création d'un URL pour l'image
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          // Mise à jour de la recommandation avec l'URL de l'image
          updateRecommendation(recommendation.id, { photoUrl: e.target.result as string });
          toast.dismiss(loadingToast);
          toast.success("Image téléchargée avec succès");
        }
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Erreur lors du téléchargement de l'image");
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.dismiss(loadingToast);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && "bg-muted")}>
      <TableCell className="w-12">
        <div className="flex items-center">
          <button 
            type="button" 
            {...attributes} 
            {...listeners} 
            className="cursor-grab touch-manipulation active:cursor-grabbing p-2 -m-2 rounded-full hover:bg-muted"
            aria-label="Déplacer l'élément"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="ml-2">{recommendation.item}</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={recommendation.observation}
          onChange={(e) => updateRecommendation(recommendation.id, { observation: e.target.value })}
          placeholder="Observation"
        />
      </TableCell>
      <TableCell>
        <Input
          value={recommendation.action}
          onChange={(e) => updateRecommendation(recommendation.id, { action: e.target.value })}
          placeholder="Action recommandée"
        />
      </TableCell>
      <TableCell>
        <Input
          value={recommendation.responsible}
          onChange={(e) => updateRecommendation(recommendation.id, { responsible: e.target.value })}
          placeholder="Responsable"
        />
      </TableCell>
      <TableCell>
        <Select 
          value={recommendation.status}
          onValueChange={(value) => updateRecommendation(recommendation.id, { 
            status: value as "pending" | "in-progress" | "completed" | "on-hold" 
          })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="on-hold">En pause</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {recommendation.photoUrl ? (
            <div className="relative group w-16 h-16">
              <img 
                src={recommendation.photoUrl} 
                alt={`Photo recommandation ${recommendation.item}`} 
                className="w-16 h-16 object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updateRecommendation(recommendation.id, { photoUrl: undefined })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Téléchargement..." : "Ajouter photo"}
              </Button>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeRecommendation(recommendation.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
