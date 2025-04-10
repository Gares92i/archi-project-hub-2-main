export type DocumentType = "pdf" | "img";

// Modifiez le type Annotation pour inclure les champs des deux formats
export interface Annotation {
  id: string;
  documentId: string;
  documentName?: string;
  x: number; // Utilisez toujours x/y plutôt que position
  y: number;
  position?: { x: number; y: number }; // Gardé pour compatibilité
  comment?: string;
  resolved?: boolean;
  isResolved?: boolean; // Pour compatibilité
  date?: string;
  createdAt: string;
  photos?: string[];
  author?: string;
  // Nouveaux champs
  lot?: string; // Lot concerné (menuiserie, électricité, etc.)
  location?: string; // Localisation (cuisine, salon, etc.)
  resolvedDate?: string;

 // Date de levée de la réserve
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";
  url: string;
  annotations?: Annotation[];
}

// Interface pour les props du dialog d'annotation
export interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void; // Corriger ici
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask: () => void;
}