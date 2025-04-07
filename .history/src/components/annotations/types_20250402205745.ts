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
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  dueDate?: string; // Format ISO string
  priority?: "low" | "medium" | "high"; // Type énuméré restreint
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

// Définir l'interface Task pour la gestion des tâches
export interface Task {
  id: string;
  title: string;
  name?: string;
  description: string;
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  dueDate: string; // Format ISO string pour les dates
  start: string; // Format ISO string pour les dates
  end: string; // Format ISO string pour les dates
  priority: "low" | "medium" | "high";
  completed: boolean;
  progress: number;
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
  [key: string]: unknown;  // Pour les propriétés supplémentaires non typées
}

export interface PartialDocument {
  id?: string;
  name?: string;
  type?: string;
  url?: string;
  annotations?: Annotation[];
  [key: string]: unknown;  // Pour les propriétés supplémentaires non typées
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
export function ensureDocument(doc: PartialDocument): Document {
  return {
    id: doc.id || Date.now().toString(),
    name: doc.name || "Document sans titre",
    type: ensureDocumentType(doc.type || "img"),
    url: doc.url || "",
    annotations: doc.annotations || []
  };
}

/**
 * Vérifie et adapte un objet pour qu'il corresponde au type Annotation
 */
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

/**
 * Fonction utilitaire pour formater une date en ISO string
 */
export function formatDateToISOString(date: Date | string | undefined): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (typeof date === 'string') {
    return date;
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Fonction utilitaire pour valider et convertir la priorité
 */
export function validatePriority(priority: string | undefined): "low" | "medium" | "high" {
  if (!priority) return "medium";
  
  if (priority === "low" || priority === "medium" || priority === "high") {
    return priority;
  }
  
  // Conversion des valeurs textuelles en valeurs acceptées
  if (priority.toLowerCase().includes("faible") || priority.toLowerCase().includes("low")) {
    return "low";
  } else if (priority.toLowerCase().includes("élevé") || priority.toLowerCase().includes("high")) {
    return "high";
  }
  
  return "medium"; // Valeur par défaut
}