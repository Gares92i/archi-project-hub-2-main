import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Annotation } from "./types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, CheckCircle, Circle, ListTodo } from "lucide-react";

// Ajoutez cette fonction à l'intérieur du fichier
function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    return "Erreur de date";
  }
}

interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask: () => void;
}

export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedAnnotation,
  onToggleResolved,
  onAddPhoto,
  onRemovePhoto,
  onUpdateComment,
  onConvertToTask,
}) => {
  const [comment, setComment] = useState("");
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  // Réinitialiser l'état lorsque l'annotation sélectionnée change
  useEffect(() => {
    if (selectedAnnotation) {
      setComment(selectedAnnotation.comment || "");
    } else {
      setComment("");
    }
  }, [selectedAnnotation]);

  // Si aucune annotation n'est sélectionnée, ne rien afficher dans le dialog
  const renderContent = () => {
    if (!selectedAnnotation) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          Aucune annotation sélectionnée
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="cursor-pointer"
              onClick={() => onToggleResolved(selectedAnnotation.id)}
            >
              {selectedAnnotation.resolved ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedAnnotation.resolved ? "Résolu" : "En attente"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(selectedAnnotation.createdAt || new Date().toISOString())}
          </span>
        </div>

        <div>
          <Textarea
            placeholder="Commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => onUpdateComment(selectedAnnotation.id, comment)}
          >
            Mettre à jour
          </Button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Photos</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingPhoto(!isAddingPhoto)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {isAddingPhoto && (
            <div className="mt-2 mb-3 space-y-2">
              <input
                type="text"
                placeholder="URL de l'image"
                className="w-full p-2 border rounded"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onAddPhoto(selectedAnnotation.id, photoUrl);
                    setPhotoUrl("");
                    setIsAddingPhoto(false);
                  }}
                  disabled={!photoUrl}
                >
                  Ajouter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingPhoto(false);
                    setPhotoUrl("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAnnotation.photos && selectedAnnotation.photos.length > 0 ? (
              selectedAnnotation.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 rounded overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemovePhoto(selectedAnnotation.id, index)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Aucune photo
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={onConvertToTask}
          >
            <ListTodo className="h-4 w-4 mr-1" />
            Créer une tâche
          </Button>
          <Button onClick={() => setIsOpen(false)}>Fermer</Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Annotation</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
