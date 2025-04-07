
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical } from "lucide-react";
import { Recommendation } from "@/components/services/types";
import { cn } from "@/lib/utils";

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
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    opacity: isDragging ? 0.8 : 1,
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
