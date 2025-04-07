import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A";
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export const ParticipantsSection = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      role: "Maître d'ouvrage",
      contact: "Belleville Sté",
      address: "99 Bd de Belleville, 75020 Paris",
      email: "contact@belleville.com",
      phone: "01 40 40 77 20",
      presence: "P",
    },
    {
      id: "2",
      role: "Architecte",
      contact: "ArchiHub Studio",
      address: "45 rue de l'Architecture, 75001 Paris",
      email: "contact@archihub.fr",
      phone: "01 23 45 67 89",
      presence: "P",
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "",
        contact: "",
        address: "",
        email: "",
        phone: "",
        presence: "P",
      },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((participant) => participant.id !== id));
  };

  const handleUpdateParticipant = (id: string, field: keyof Participant, value: string) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === id ? { ...participant, [field]: value } : participant
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setParticipants((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div>Participants</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Image de légende pour les codes de présence */}
        <div className="mb-4 border p-3 rounded-md bg-muted/30">
          <div className="text-sm font-medium mb-2">Légende de présence</div>
          <div className="flex items-center gap-6 text-sm">
            <span><strong>P</strong> : Présent</span>
            <span><strong>R</strong> : Retard</span>
            <span><strong>A</strong> : Absent</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={participants.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun participant ajouté
                </div>
              ) : (
                <div className="space-y-3">
                  {/* En-têtes des colonnes */}
                  <div className="grid grid-cols-7 gap-2 px-10 text-xs font-medium text-muted-foreground">
                    <div>Rôle</div>
                    <div>Contact</div>
                    <div>Adresse</div>
                    <div>Email</div>
                    <div>Téléphone</div>
                    <div className="text-center">Présence</div>
                    <div></div>
                  </div>

                  {participants.map((participant) => (
                    <SortableItem key={participant.id} id={participant.id}>
                      <div className="grid grid-cols-7 gap-2 items-center border rounded-md p-2 bg-card">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <Input
                            placeholder="Rôle"
                            value={participant.role}
                            onChange={(e) =>
                              handleUpdateParticipant(participant.id, "role", e.target.value)
                            }
                            className="w-full"
                          />
                        </div>
                        <Input
                          placeholder="Contact"
                          value={participant.contact}
                          onChange={(e) =>
                            handleUpdateParticipant(participant.id, "contact", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Adresse"
                          value={participant.address}
                          onChange={(e) =>
                            handleUpdateParticipant(participant.id, "address", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Email"
                          value={participant.email}
                          onChange={(e) =>
                            handleUpdateParticipant(participant.id, "email", e.target.value)
                          }
                          type="email"
                        />
                        <Input
                          placeholder="Téléphone"
                          value={participant.phone}
                          onChange={(e) =>
                            handleUpdateParticipant(participant.id, "phone", e.target.value)
                          }
                        />
                        <Select
                          value={participant.presence}
                          onValueChange={(value) =>
                            handleUpdateParticipant(participant.id, "presence", value as "P" | "R" | "A")
                          }
                        >
                          <SelectTrigger className="w-full text-center">
                            <SelectValue placeholder="Présence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="R">R</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
          
          <Button variant="outline" onClick={handleAddParticipant} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un participant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};