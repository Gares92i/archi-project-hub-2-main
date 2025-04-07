import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A" | "E";
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
      {/* En-tête stylisé comme demandé */}
      <div className="participants-bar" style={{
        backgroundColor: "#f4f4f9",
        padding: "15px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #ccc",
        borderTopLeftRadius: "0.375rem",
        borderTopRightRadius: "0.375rem"
      }}>
        <span className="title" style={{
          color: "#007bff",
          fontWeight: "bold",
          fontSize: "20px",
          textTransform: "uppercase"
        }}>PARTICIPANTS</span>
        <div className="status-group" style={{
          display: "flex",
          gap: "20px"
        }}>
          <span className="status present" style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#28a745"
          }}>
            <span className="letter" style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "24px",
              marginRight: "6px",
              fontWeight: "bold",
              border: "2px solid #28a745",
              color: "#28a745"
            }}>P</span> Présent
          </span>
          <span className="status late" style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#fd7e14"
          }}>
            <span className="letter" style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "24px",
              marginRight: "6px",
              fontWeight: "bold",
              border: "2px solid #fd7e14",
              color: "#fd7e14"
            }}>R</span> Retard
          </span>
          <span className="status absent" style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#dc3545"
          }}>
            <span className="letter" style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "24px",
              marginRight: "6px",
              fontWeight: "bold",
              border: "2px solid #dc3545",
              color: "#dc3545"
            }}>A</span> Absent
          </span>
          <span className="status excused" style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#007bff"
          }}>
            <span className="letter" style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "24px",
              marginRight: "6px",
              fontWeight: "bold",
              border: "2px solid #007bff",
              color: "#007bff"
            }}>E</span> Excusé
          </span>
        </div>
      </div>
      
      <CardContent className="pt-6">
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
                            handleUpdateParticipant(participant.id, "presence", value as "P" | "R" | "A" | "E")
                          }
                        >
                          <SelectTrigger className="w-full text-center">
                            <SelectValue placeholder="Présence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="R">R</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="E">E</SelectItem>
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