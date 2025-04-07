import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Annotation } from './types';
import { toast } from 'sonner';

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
  // Utiliser des valeurs initiales pour éviter les inputs non contrôlés
  const [taskData, setTaskData] = useState({
    title: '',
    assigneeId: '',
    dueDate: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Important : Mettre à jour les données quand l'annotation change ou quand le dialogue s'ouvre
  useEffect(() => {
    if (isOpen && annotation) {
      setTaskData({
        title: annotation.comment.substring(0, 50) || 'Nouvelle tâche',
        assigneeId: '',
        dueDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        priority: 'medium'
      });
    }
  }, [isOpen, annotation]);

  // Mise à jour du state lors des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      // Simuler la création d'une tâche
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Générer un ID pour la démo
      const taskId = `task_${Date.now()}`;
      
      toast.success('Tâche créée avec succès !');
      onTaskCreated(taskId);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
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
            Créez une nouvelle tâche à partir de cette annotation
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
                <SelectItem value="user1">Utilisateur 1</SelectItem>
                <SelectItem value="user2">Utilisateur 2</SelectItem>
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
