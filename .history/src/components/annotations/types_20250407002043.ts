export type DocumentType = "pdf" | "img";

// Modifiez le type Annotation pour inclure les champs des deux formats
export interface Annotation {
  id: string;
  x?: number;
  y?: number;
  position?: { x: number; y: number }; // Propriété optionnelle pour compatibilité
  comment: string;
  resolved?: boolean; // Pas isResolved mais resolved
  isResolved?: boolean;  // Pour compatibilité avec l'ancien format
  photos?: string[];
  createdAt?: string;
  date?: string;         // Pour compatibilité avec l'ancien format
  author?: string;       // Pour compatibilité avec l'ancien format
  projectId?: string;    // Pour compatibilité avec l'ancien format
  documentId?: string;   // Pour les annotations liées à un document  
  documentName?: string; // Pour l'affichage dans le tableau
}

export interface Document {
  id: string;
  name: string;
  url: string;
filename?: string;; // Assurez-vous que type est obligatoire
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