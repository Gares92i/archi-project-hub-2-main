
import { useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Recommendation } from "@/components/services/types";
import { SortableRecommendationItem } from "./SortableRecommendationItem";
import { cn } from "@/lib/utils";

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  setRecommendations: React.Dispatch<React.SetStateAction<Recommendation[]>>;
  isMobile: boolean;
}

export const RecommendationsSection = ({ recommendations, setRecommendations, isMobile }: RecommendationsSectionProps) => {
  // Enhanced DnD sensors setup with better touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 1,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const addRecommendation = () => {
    const newRecommendation: Recommendation = {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      item: recommendations.length + 1,
      observation: "",
      action: "",
      responsible: "",
      status: "pending",
    };
    
    setRecommendations([...recommendations, newRecommendation]);
  };

  const updateRecommendation = (id: string, data: Partial<Recommendation>) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, ...data } : rec
    ));
  };

  const removeRecommendation = (id: string) => {
    setRecommendations(recommendations.filter(rec => rec.id !== id));
    // Reorder items
    setRecommendations(prev => prev.map((rec, index) => ({
      ...rec,
      item: index + 1,
    })));
  };

  const handleRecommendationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = recommendations.findIndex(r => r.id === active.id);
      const overIndex = recommendations.findIndex(r => r.id === over.id);
      
      const newRecommendations = [...recommendations];
      const [movedItem] = newRecommendations.splice(activeIndex, 1);
      newRecommendations.splice(overIndex, 0, movedItem);
      
      // Update item numbers
      const reorderedRecommendations = newRecommendations.map((rec, index) => ({
        ...rec,
        item: index + 1
      }));
      
      setRecommendations(reorderedRecommendations);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recommandations</CardTitle>
            <CardDescription>
              Actions à entreprendre suite à la visite
            </CardDescription>
          </div>
          <Button type="button" onClick={addRecommendation}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une recommandation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Aucune recommandation ajoutée
            </p>
            <Button type="button" className="mt-4" onClick={addRecommendation}>
              Ajouter une recommandation
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleRecommendationDragEnd}
            modifiers={[restrictToVerticalAxis]}>
            <div className={cn("w-full", isMobile && "overflow-x-auto")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Item</TableHead>
                    <TableHead>Observation</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Photo</TableHead> {/* Colonne ajoutée */}
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={recommendations.map((rec) => rec.id)}
                    strategy={verticalListSortingStrategy}>
                    {recommendations.map((rec) => (
                      <SortableRecommendationItem
                        key={rec.id}
                        recommendation={rec}
                        updateRecommendation={updateRecommendation}
                        removeRecommendation={removeRecommendation}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
