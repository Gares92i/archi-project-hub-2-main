
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addTask } from "@/components/services/taskService";
import { Task } from "@/components/gantt/types";

interface NewTaskSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
}

const NewTaskSheet = ({ isOpen, onOpenChange, onTaskCreated }: NewTaskSheetProps) => {
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    projectId: "",
    projectName: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    description: ""
  });

  const handleCreateTask = async () => {
    try {
      // Trouver le nom du projet à partir de l'ID
      const projectName = newTaskData.projectId === "1" ? "Villa Moderna" : 
                        newTaskData.projectId === "2" ? "Tour Horizon" :
                        newTaskData.projectId === "3" ? "Résidence Eterna" :
                        newTaskData.projectId === "4" ? "Centre Commercial Lumina" :
                        newTaskData.projectId === "5" ? "Bureaux Panorama" :
                        newTaskData.projectId === "6" ? "École Futura" :
                        newTaskData.projectId === "7" ? "Hôtel Riviera" :
                        newTaskData.projectId === "8" ? "Complexe Sportif Olympia" : "";
      
      // Calculer les dates de début et de fin
      const dueDate = newTaskData.dueDate;
      const startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() - 5); // 5 jours avant la date d'échéance
      
      const newTaskPayload = {
        title: newTaskData.title,
        name: newTaskData.title,
        projectId: newTaskData.projectId,
        projectName: projectName,
        dueDate: dueDate,
        start: startDate.toISOString().split('T')[0],
        end: dueDate,
        priority: newTaskData.priority,
        completed: false,
        progress: 0
      };
      
      const createdTask = await addTask(newTaskPayload);
      onTaskCreated(createdTask);
      
      // Réinitialiser le formulaire
      setNewTaskData({
        title: "",
        projectId: "",
        projectName: "",
        dueDate: "",
        priority: "medium",
        description: ""
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Nouvelle tâche</SheetTitle>
          <SheetDescription>
            Créez une nouvelle tâche pour un projet. Remplissez les détails ci-dessous.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre de la tâche</Label>
            <Input 
              id="task-title" 
              placeholder="Entrez le titre de la tâche"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-name">Projet associé</Label>
            <Select 
              value={newTaskData.projectId} 
              onValueChange={(value) => setNewTaskData({...newTaskData, projectId: value})}
            >
              <SelectTrigger id="project-name">
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Villa Moderna</SelectItem>
                <SelectItem value="2">Tour Horizon</SelectItem>
                <SelectItem value="3">Résidence Eterna</SelectItem>
                <SelectItem value="4">Centre Commercial Lumina</SelectItem>
                <SelectItem value="5">Bureaux Panorama</SelectItem>
                <SelectItem value="6">École Futura</SelectItem>
                <SelectItem value="7">Hôtel Riviera</SelectItem>
                <SelectItem value="8">Complexe Sportif Olympia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Date d'échéance</Label>
            <Input 
              id="due-date" 
              type="date"
              value={newTaskData.dueDate}
              onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <RadioGroup 
              value={newTaskData.priority}
              onValueChange={(value) => setNewTaskData({...newTaskData, priority: value as "low" | "medium" | "high"})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Faible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Moyenne</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">Haute</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optionnelle)</Label>
            <Input 
              id="task-description" 
              placeholder="Description de la tâche"
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
            />
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button 
            onClick={handleCreateTask}
            disabled={!newTaskData.title || !newTaskData.projectId || !newTaskData.dueDate}
          >
            Créer la tâche
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NewTaskSheet;
