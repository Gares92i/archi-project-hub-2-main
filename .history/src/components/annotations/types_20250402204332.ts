export interface Annotation {
  id: string;
  // Modifiez ces propriétés pour correspondre à votre utilisation réelle
  x: number;
  y: number;
  position?: { x: number; y: number }; // Ajout pour compatibilité
  comment: string;
  author?: string;
  date?: string;
  resolved: boolean;
  isResolved?: boolean; // Ajout pour compatibilité
  photos: string[];
  projectId?: string;
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

/**
 * Assure que le type d'un document est strictement "pdf" ou "img"
 */
export function ensureDocumentType(type: string): "pdf" | "img" {
  return type === "pdf" ? "pdf" : "img";
}

/**
 * Vérifie et adapte un objet pour qu'il corresponde au type Document
 */
export function ensureDocument(doc: any): Document {
  return {
    ...doc,
    type: ensureDocumentType(doc.type),
    annotations: doc.annotations || []
  };
}

/**
 * Vérifie et adapte un objet pour qu'il corresponde au type Annotation
 */
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