export interface Annotation {
  id: string;
  position: {
    x: number;
    y: number;
  };
  comment: string;
  author: string;
  date: string;
  isResolved: boolean;
  photos: string[];
  projectId: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";
  url: string;
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