export interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
  resolved: boolean;
  photos: string[];
  // Propriétés optionnelles pour compatibilité
  position?: { x: number; y: number };
  isResolved?: boolean;
  author?: string;
  date?: string;
  projectId?: string;
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
}

export interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  projectId?: string;
}

// Fonctions utilitaires pour la gestion des types
export function ensureDocumentType(type: string): "pdf" | "img" {
  return type === "pdf" ? "pdf" : "img";
}

export function ensureDocument(doc: any): Document {
  return {
    ...doc,
    type: ensureDocumentType(doc.type),
    annotations: doc.annotations || []
  };
}

export function ensureAnnotation(ann: any): Annotation {
  return {
    id: ann.id || Date.now().toString(),
    x: ann.x || (ann.position ? ann.position.x : 0),
    y: ann.y || (ann.position ? ann.position.y : 0),
    comment: ann.comment || "",
    resolved: typeof ann.resolved !== 'undefined' ? ann.resolved : 
             typeof ann.isResolved !== 'undefined' ? ann.isResolved : false,
    photos: ann.photos || [],
  };
}