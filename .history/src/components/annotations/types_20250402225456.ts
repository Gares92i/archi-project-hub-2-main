// Interfaces principales
export interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
  resolved: boolean;
  photos: string[];
  author?: string;
  date?: string;
  projectId?: string;
  position?: { x: number; y: number }; // Pour compatibilité
  isResolved?: boolean; // Pour compatibilité
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";
  url: string;
  annotations: Annotation[];
}

export interface Task {
  id: string;
  title: string;
  name?: string;
  description: string;
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  dueDate: string; // Format ISO
  start: string;  // Format ISO
  end: string;    // Format ISO
  priority: "low" | "medium" | "high";
  completed: boolean;
  progress: number;
}

// Interfaces pour les props des composants
export interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onRemovePhoto: (id: string, photoIndex: number) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onConvertToTask: (annotationId: string) => void; // Assurez-vous que cette prop existe
  projectId?: string; // Assurez-vous que cette prop existe aussi
}

export interface AnnotationsSidebarProps {
  annotations: Annotation[];
  onToggleResolved: (id: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onConvertToTask: (annotationId: string) => void; // Ajouter cette propriété
}

export interface ConvertToTaskData {
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  dueDate?: string; // Format ISO
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  progress?: number;
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

// Interfaces pour les objets partiels
export interface PartialAnnotation {
  id?: string;
  x?: number;
  y?: number;
  position?: { x: number; y: number };
  comment?: string;
  author?: string;
  date?: string;
  resolved?: boolean;
  isResolved?: boolean;
  photos?: string[];
  projectId?: string;
  [key: string]: unknown;  // Pour les propriétés supplémentaires
}

export interface PartialDocument {
  id?: string;
  name?: string;
  type?: string;
  url?: string;
  annotations?: Annotation[];
  [key: string]: unknown;  // Pour les propriétés supplémentaires
}

// Fonctions utilitaires
export function ensureDocumentType(type: string | undefined): "pdf" | "img" {
  return type === "pdf" ? "pdf" : "img";
}

export function ensureDocument(doc: PartialDocument): Document {
  return {
    id: doc.id || Date.now().toString(),
    name: doc.name || "Document sans titre",
    type: ensureDocumentType(doc.type),
    url: doc.url || "",
    annotations: doc.annotations || []
  };
}

export function ensureAnnotation(ann: PartialAnnotation): Annotation {
  return {
    id: ann.id || Date.now().toString(),
    x: ann.x ?? (ann.position ? ann.position.x : 0),
    y: ann.y ?? (ann.position ? ann.position.y : 0),
    comment: ann.comment || "",
    resolved: ann.resolved ?? ann.isResolved ?? false,
    photos: ann.photos || [],
    author: ann.author,
    date: ann.date,
    projectId: ann.projectId
  };
}

export function formatDateToISOString(date: Date | string | undefined): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (typeof date === 'string') {
    return date;
  }
  
  return date.toISOString().split('T')[0];
}

export function validatePriority(priority: string | undefined): "low" | "medium" | "high" {
  if (!priority) return "medium";
  
  if (priority === "low" || priority === "medium" || priority === "high") {
    return priority;
  }
  
  if (priority.toLowerCase().includes("faible") || priority.toLowerCase().includes("low")) {
    return "low";
  } else if (priority.toLowerCase().includes("élevé") || priority.toLowerCase().includes("high")) {
    return "high";
  }
  
  return "medium";
}

export function isConvertToTaskDataKey(key: string): key is keyof ConvertToTaskData {
  const validKeys: Array<keyof ConvertToTaskData> = [
    'title', 'description', 'projectId', 'projectName', 
    'assigneeId', 'dueDate', 'priority', 'completed', 'progress'
  ];
  
  return validKeys.includes(key as keyof ConvertToTaskData);
}