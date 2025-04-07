
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Annotation, ConvertToTaskData } from './types';
import { toast } from 'sonner';
import { addTask } from "@/components/services/taskService";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ConvertToTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  annotation: Annotation | null;
  projectId: string;
  onTaskCreated: () => void;
}

export const ConvertToTaskDialog: React.FC<ConvertToTaskDialogProps> = ({
  isOpen,
  setIsOpen,
  annotation,
  projectId,
  onTaskCreated
}) => {
  const [taskData, setTaskData] = useState<ConvertToTaskData>({
    title: annotation?.comment.slice(0, 50) || '',
    projectId: projectId,
    assignee: annotation?.author || 'Jude RAVI',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ConvertToTaskData, value: string) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Créer une nouvelle tâche
      await addTask({
        title: `${taskData.title}`,
        name: taskData.title,
        projectName: "Projet d'exemple",
        projectId: taskData.projectId,
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        start: new Date().toISOString().split('T')[0],
        end: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: taskData.priority,
        completed: false,
        progress: 0
      });
      
      toast.success('Tâche créée avec succès !');
      onTaskCreated();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche :', error);
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir en tâche</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre de la tâche</Label>
            <Input 
              id="task-title" 
              value={taskData.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Titre de la tâche"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assigné à</Label>
            <Select 
              value={taskData.assignee} 
              onValueChange={(value) => handleChange("assignee", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une personne" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jude RAVI">Jude RAVI</SelectItem>
                <SelectItem value="Utilisateur">Vous</SelectItem>
                <SelectItem value="Équipe Technique">Équipe Technique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Échéance</Label>
            <Input 
              id="task-due-date" 
              type="date" 
              value={taskData.dueDate} 
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-priority">Priorité</Label>
            <Select 
              value={taskData.priority} 
              onValueChange={(value: "low" | "medium" | "high") => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Créer la tâche'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
