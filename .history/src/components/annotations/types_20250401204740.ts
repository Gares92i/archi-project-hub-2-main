
export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img"; 
  url: string;
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  position: { x: number; y: number };
  comment: string;
  author: string;
  date: string;
  isResolved: boolean;
  photos: string[];
  projectId?: string;
}

export interface ConvertToTaskData {
  title: string;
  projectId: string;
  assignee?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}
export interface AnnotationsSidebarProps {
  annotations: Annotation[];
  onToggleResolved: (id: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onConvertToTask?: () => void;
}

export interface AnnotationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedAnnotation: Annotation | null;
  onToggleResolved: (id: string) => void;
  onAddPhoto?: (id: string, photoUrl: string) => void;
  onRemovePhoto?: (id: string, photoIndex: number) => void;
  onUpdateComment?: (id: string, comment: string) => void;
  onConvertToTask?: () => void;
}
