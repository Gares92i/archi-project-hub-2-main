import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Annotation } from "./types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, CheckCircle, Circle, Calendar, Trash2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Liste des lots disponibles
const LOTS = [
  "Gros œuvre",
  "Charpente",
  "Couverture",
  "Menuiserie ext.",
  "Menuiserie int.",
  "Plomberie",
  "Électricité",
  "Peinture",
  "Carrelage",
  "Isolation",
  "VRD",
  "Autre"
];

// Liste des localisations courantes
const LOCATIONS = [
  "Cuisine",
  "Salon",
  "Chambre 1",
  "Chambre 2",
  "Chambre 3",
  "Salle de bain",
  "WC",
  "Entrée",
  "Couloir",
  "Escalier",
  "Extérieur",
  "Toiture",
  "Façade",
  "Autre"
];

function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    
    return format(date, "dd MMMM yyyy", { locale: fr });
  } catch (error) {
    return "Erreur de date";
  }
}

// Fonction pour convertir un fichier en dataURL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsDataURL(file);
  });
};

interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string, resolved?: boolean) => void;
  onUpdateAnnotation?: (id: string, data: Partial<Annotation>) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask?: () => void;
  onDeleteAnnotation?: (annotation: Annotation) => void;
}

export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedAnnotation,
  onToggleResolved,
  onUpdateAnnotation,
  onAddPhoto,
  onRemovePhoto,
  onUpdateComment,
  onConvertToTask,
  onDeleteAnnotation,
}) => {
  const [comment, setComment] = useState("");
  const [lot, setLot] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [resolvedDate, setResolvedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (selectedAnnotation) {
      setComment(selectedAnnotation.comment || "");
      setLot(selectedAnnotation.lot || "");
      setLocation(selectedAnnotation.location || "");
      setResolvedDate(selectedAnnotation.resolvedDate ? new Date(selectedAnnotation.resolvedDate) : undefined);
    } else {
      setComment("");
      setLot("");
      setLocation("");
      setResolvedDate(undefined);
    }
  }, [selectedAnnotation, isOpen]);

  const handleResolved = () => {
    if (selectedAnnotation) {
      const newResolvedState = !(selectedAnnotation.resolved || selectedAnnotation.isResolved);
      onToggleResolved(selectedAnnotation.id, newResolvedState);
      
      // Si on marque comme résolu, définir la date à aujourd'hui
      if (newResolvedState) {
        const today = new Date();
        setResolvedDate(today);
        if (onUpdateAnnotation) {
          onUpdateAnnotation(selectedAnnotation.id, { resolvedDate: today.toISOString() });
        }
      } else if (onUpdateAnnotation) {
        // Si on marque comme non résolu, optionnellement effacer la date de résolution
        setResolvedDate(undefined);
        onUpdateAnnotation(selectedAnnotation.id, { resolvedDate: undefined });
      }
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleLotChange = (value: string) => {
    setLot(value);
    if (selectedAnnotation && onUpdateAnnotation) {
      onUpdateAnnotation(selectedAnnotation.id, { lot: value });
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (selectedAnnotation && onUpdateAnnotation) {
      onUpdateAnnotation(selectedAnnotation.id, { location: value });
    }
  };

  // Modifiez la fonction handleResolvedDateChange pour ne pas changer automatiquement le statut resolved
  const handleResolvedDateChange = (date: Date | undefined) => {
    setResolvedDate(date);
    if (selectedAnnotation && onUpdateAnnotation) {
      // Ne changez que la date sans modifier le statut resolved
      onUpdateAnnotation(selectedAnnotation.id, { 
        resolvedDate: date ? date.toISOString() : undefined,
        // Ne pas modifier le statut resolved ici
        // Supprimez ou commentez les lignes suivantes :
        // resolved: !!date,
        // isResolved: !!date
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAnnotation) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image");
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      onAddPhoto(selectedAnnotation.id, dataUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
    }
  };

  const handleSaveComment = () => {
    if (selectedAnnotation) {
      onUpdateComment(selectedAnnotation.id, comment);
    }
  };

  const renderContent = () => {
    if (!selectedAnnotation) {
      return <div className="p-4">Aucune annotation sélectionnée</div>;
    }

    const isResolved = selectedAnnotation.resolved || selectedAnnotation.isResolved;

    return (
      <div className="space-y-4">
        <div className="px-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Créée le {formatDate(selectedAnnotation.createdAt || selectedAnnotation.date || "")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolved}
              className={isResolved ? "text-green-600" : ""}
            >
              {isResolved ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {isResolved ? "Résolu" : "À résoudre"}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lot">Lot concerné</Label>
              <Select value={lot} onValueChange={handleLotChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un lot" />
                </SelectTrigger>
                <SelectContent>
                  {LOTS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Select value={location} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une localisation" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                onBlur={handleSaveComment}
                placeholder="Ajouter un commentaire..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Date de levée</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resolvedDate ? format(resolvedDate, "dd MMMM yyyy", { locale: fr }) : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={resolvedDate}
                    onSelect={handleResolvedDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Photos</Label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ajouter
                    </span>
                  </Button>
                </label>
              </div>

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
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {onDeleteAnnotation && (
            <Button 
              onClick={() => {
                if (selectedAnnotation && onDeleteAnnotation) {
                  console.log("Suppression de l'annotation depuis le dialog:", selectedAnnotation);
                  onDeleteAnnotation(selectedAnnotation);
                  setIsOpen(false);
                }
              }} 
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          )}
          <div className="flex gap-2">
            {onConvertToTask && (
              <Button 
                onClick={onConvertToTask} 
                variant="outline"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Convertir en tâche
              </Button>
            )}
            <Button onClick={() => setIsOpen(false)}>Fermer</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Annotation</DialogTitle>
          <DialogDescription>
            Détails de l'annotation et options de modification.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
