import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Annotation } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ConvertToTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  annotation: Annotation | null;
  projectId: string;
  onTaskCreated: (taskId: string) => void;
}

export const ConvertToTaskDialog: React.FC<ConvertToTaskDialogProps> = ({
  isOpen,
  setIsOpen,
  annotation,
  projectId,
  onTaskCreated,
}) => {
  // Initialiser tous les états avec des valeurs par défaut pour éviter le problème contrôlé/non contrôlé
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // Réinitialiser les valeurs quand l'annotation change
  useEffect(() => {
    if (annotation) {
      // Préremplir avec les détails de l'annotation
      setTitle(`Annotation #${annotation.id.slice(-4)}`);
      setDescription(annotation.comment || "");
      setPriority("medium");
      setAssignedTo("");
      
      // Définir une date d'échéance par défaut (1 semaine)
      const oneWeekLater = new Date();
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      setDueDate(oneWeekLater.toISOString().split("T")[0]);
    } else {
      // Réinitialiser les valeurs
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedTo("");
      setDueDate("");
    }
  }, [annotation]);
  
  const handleSubmit = () => {
    if (!annotation || !projectId) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: title || `Annotation #${annotation.id.slice(-4)}`,
      description,
      priority,
      assignedTo: assignedTo ? [assignedTo] : [],
      dueDate,
      status: "todo",
      projectId,
      annotationId: annotation.id,
      createdAt: new Date().toISOString(),
    };
    
    // Stocker la nouvelle tâche
    try {
      const storedTasks = localStorage.getItem("project_tasks") || "[]";
      const tasks = JSON.parse(storedTasks);
      tasks.push(newTask);
      localStorage.setItem("project_tasks", JSON.stringify(tasks));
      
      onTaskCreated(newTask.id);
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convertir en tâche</DialogTitle>
          <DialogDescription>
            Créez une tâche à partir de cette annotation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la tâche"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigner à</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Nom ou ID"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Créer la tâche
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
