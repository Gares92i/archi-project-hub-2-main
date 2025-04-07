import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Annotation, 
  ConvertToTaskData, 
  validatePriority, 
  formatDateToISOString 
} from './types';
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
  onTaskCreated
}) => {
  const [taskData, setTaskData] = useState<ConvertToTaskData>({
    title: '',
    description: annotation?.comment || '',
    projectId: projectId,
    assigneeId: '',
    dueDate: undefined,
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mise à jour du state lors des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  // Gestion des changements de valeur pour les composants Select
  const handleSelectChange = (name: string, value: string) => {
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire pour créer une tâche
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation des données
      if (!taskData.title) {
        toast.error('Veuillez saisir un titre pour la tâche');
        return;
      }
      
      // Créer une nouvelle tâche avec les types corrects
      const taskId = await addTask({
        title: taskData.title,
        name: taskData.title,
        description: taskData.description || annotation?.comment || '',
        projectId: projectId,
        projectName: "Projet d'exemple",
        assigneeId: taskData.assigneeId,
        dueDate: formatDateToISOString(taskData.dueDate),
        start: formatDateToISOString(new Date()),
        end: formatDateToISOString(
          taskData.dueDate || 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        priority: validatePriority(taskData.priority),
        completed: false,
        progress: 0
      });

      toast.success('Tâche créée avec succès !');
      onTaskCreated(taskId);
      setIsOpen(false);
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
          <DialogDescription>
            Créez une nouvelle tâche à partir de cette annotation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Titre de la tâche</Label>
            <Input 
              id="task-title" 
              name="title"
              value={taskData.title} 
              onChange={handleChange}
              placeholder="Titre de la tâche"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assigné à</Label>
            <Select 
              value={taskData.assigneeId}
              onValueChange={(value) => handleSelectChange('assigneeId', value)}
            >
              <SelectTrigger id="task-assignee">
                <SelectValue placeholder="Sélectionner une personne" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user1">Jude RAVI</SelectItem>
                <SelectItem value="user2">Utilisateur</SelectItem>
                <SelectItem value="team1">Équipe Technique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-due-date">Échéance</Label>
            <Input 
              id="task-due-date" 
              name="dueDate"
              type="date" 
              value={taskData.dueDate} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-priority">Priorité</Label>
            <Select 
              value={taskData.priority} 
              onValueChange={(value) => handleSelectChange('priority', value)}
            >
              <SelectTrigger id="task-priority">
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
