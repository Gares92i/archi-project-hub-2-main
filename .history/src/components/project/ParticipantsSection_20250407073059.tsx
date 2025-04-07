import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "@/components/ui/sortable-item";

interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A";
}

export const ParticipantsSection = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      role: "Maître d'ouvrage",
      contact: "Belleville Sté",
      address: "99 Bd de Belleville, 75020 Paris",
      email: "demo@archipad.com",
      phone: "01 40 40 77 20",
      presence: "P",
    },
  ]);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setParticipants((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Participants</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={participants} strategy={verticalListSortingStrategy}>
          {participants.map((participant) => (
            <SortableItem key={participant.id} id={participant.id}>
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <Input
                  placeholder="Rôle"
                  value={participant.role}
                  onChange={(e) =>
                    handleUpdateParticipant(participant.id, "role", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Contact"
                  value={participant.contact}
                  onChange={(e) =>
                    handleUpdateParticipant(participant.id, "contact", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Adresse"
                  value={participant.address}
                  onChange={(e) =>
                    handleUpdateParticipant(participant.id, "address", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Email"
                  value={participant.email}
                  onChange={(e) =>
                    handleUpdateParticipant(participant.id, "email", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Téléphone"
                  value={participant.phone}
                  onChange={(e) =>
                    handleUpdateParticipant(participant.id, "phone", e.target.value)
                  }
                  className="flex-1"
                />
                <Select
                  value={participant.presence}
                  onValueChange={(value) =>
                    handleUpdateParticipant(participant.id, "presence", value)
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Présence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">Présent</SelectItem>
                    <SelectItem value="R">Retard</SelectItem>
                    <SelectItem value="A">Absent</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveParticipant(participant.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <Button variant="outline" onClick={handleAddParticipant}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un participant
      </Button>
    </div>
  );
};