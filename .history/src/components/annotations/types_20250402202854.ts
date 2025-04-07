export interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
  resolved: boolean;
  photos?: string[];
  // Autres propriétés...
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";
  url: string;
  annotations: Annotation[];
}

export interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask: (id: string) => void;
}

export interface AnnotationsSidebarProps {
  annotations: Annotation[];
  onToggleResolved: (id: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onConvertToTask: (id: string) => void;
}

export interface ConvertToTaskData {
  title: string;
  description: string;
  assigneeId?: string;
  dueDate?: Date;
  priority?: string;
  // Autres propriétés...
}

export interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
}