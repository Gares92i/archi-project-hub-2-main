
import { useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Observation } from "@/components/services/types";
import { SortableObservationItem } from "./SortableObservationItem";
import { cn } from "@/lib/utils";

interface ObservationsSectionProps {
  observations: Observation[];
  setObservations: React.Dispatch<React.SetStateAction<Observation[]>>;
  isMobile: boolean;
}

export const ObservationsSection = ({ observations, setObservations, isMobile }: ObservationsSectionProps) => {
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

  const addObservation = () => {
    const newObservation: Observation = {
      id: `obs-${Math.random().toString(36).substr(2, 9)}`,
      item: observations.length + 1,
      observation: "",
      description: "",
      photoUrl: undefined,
    };
    
    setObservations([...observations, newObservation]);
  };

  const updateObservation = (id: string, data: Partial<Observation>) => {
    setObservations(observations.map(obs => 
      obs.id === id ? { ...obs, ...data } : obs
    ));
  };

  const removeObservation = (id: string) => {
    setObservations(observations.filter(obs => obs.id !== id));
    // Reorder items
    setObservations(prev => prev.map((obs, index) => ({
      ...obs,
      item: index + 1,
    })));
  };

  const handleObservationDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = observations.findIndex(o => o.id === active.id);
      const overIndex = observations.findIndex(o => o.id === over.id);
      
      const newObservations = [...observations];
      const [movedItem] = newObservations.splice(activeIndex, 1);
      newObservations.splice(overIndex, 0, movedItem);
      
      // Update item numbers
      const reorderedObservations = newObservations.map((obs, index) => ({
        ...obs,
        item: index + 1
      }));
      
      setObservations(reorderedObservations);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Observations</CardTitle>
            <CardDescription>Constats et remarques sur le chantier</CardDescription>
          </div>
          <Button type="button" onClick={addObservation}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une observation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {observations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aucune observation ajoutée</p>
            <Button type="button" className="mt-4" onClick={addObservation}>
              Ajouter une observation
            </Button>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleObservationDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <div className={cn("w-full", isMobile && "overflow-x-auto")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Item</TableHead>
                    <TableHead>Observation</TableHead>
                    <TableHead>Description détaillée</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={observations.map(obs => obs.id)} strategy={verticalListSortingStrategy}>
                    {observations.map((obs) => (
                      <SortableObservationItem 
                        key={obs.id}
                        observation={obs}
                        updateObservation={updateObservation}
                        removeObservation={removeObservation}
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
