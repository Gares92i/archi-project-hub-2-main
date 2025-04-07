
import { useState, useEffect } from "react";
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
import { updateTask } from "@/components/services/taskService";
import { Task } from "@/components/gantt/types";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface EditTaskSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdated: (task: Task) => void;
}

const EditTaskSheet = ({ isOpen, onOpenChange, task, onTaskUpdated }: EditTaskSheetProps) => {
  const [taskData, setTaskData] = useState<Partial<Task>>({
    title: "",
    projectId: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    description: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title || task.name,
        projectId: task.projectId,
        dueDate: task.dueDate,
        priority: task.priority,
        description: task.description || ""
      });
    }
  }, [task]);

  const handleUpdateTask = async () => {
    if (!task) return;
    
    try {
      setIsSubmitting(true);
      
      // Préserver les projets noms en fonction de l'ID
      const projectName = task.projectName;
      
      const updatedTaskPayload = {
        ...task,
        title: taskData.title,
        name: taskData.title,
        projectId: taskData.projectId,
        projectName: projectName,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        description: taskData.description
      };
      
      const updatedTask = await updateTask(task.id, updatedTaskPayload);
      onTaskUpdated(updatedTask);
      
      toast.success("Tâche mise à jour avec succès");
      onOpenChange(false);
    } catch (error) {
      toast.error("Échec de la mise à jour de la tâche");
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Modifier la tâche</SheetTitle>
          <SheetDescription>
            Modifiez les détails de la tâche ci-dessous.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre de la tâche</Label>
            <Input 
              id="task-title" 
              placeholder="Entrez le titre de la tâche"
              value={taskData.title}
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-name">Projet associé</Label>
            <Select 
              value={taskData.projectId} 
              onValueChange={(value) => setTaskData({...taskData, projectId: value})}
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
              value={taskData.dueDate}
              onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <RadioGroup 
              value={taskData.priority}
              onValueChange={(value) => setTaskData({...taskData, priority: value as "low" | "medium" | "high"})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="edit-low" />
                <Label htmlFor="edit-low">Faible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="edit-medium" />
                <Label htmlFor="edit-medium">Moyenne</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="edit-high" />
                <Label htmlFor="edit-high">Haute</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optionnelle)</Label>
            <Textarea 
              id="task-description" 
              placeholder="Description de la tâche"
              value={taskData.description}
              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button 
            onClick={handleUpdateTask}
            disabled={isSubmitting || !taskData.title || !taskData.projectId || !taskData.dueDate}
          >
            Mettre à jour
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditTaskSheet;
