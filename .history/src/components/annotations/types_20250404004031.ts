export type DocumentType = "pdf" | "img";

export interface Annotation {
  id: string;
  x: number;
  y: number;
  position?: { x: number; y: number }; // Propriété optionnelle pour compatibilité
  comment: string;
  resolved: boolean; // Pas isResolved mais resolved
  photos: string[];
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: DocumentType; // Assurez-vous que type est obligatoire
  annotations: Annotation[];
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