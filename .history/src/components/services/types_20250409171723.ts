export interface Observation {
  id: string;
  item: number;
  observation: string;
  description: string;
  photoUrl?: string;
}

export interface Recommendation {
  id: string;
  item: number;
  observation: string;
  action: string;
  responsible: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  photoUrl?: string; // Ajout du champ photoUrl
}

export interface SiteVisitReport {
  id: string;
  projectId: string;
  visitDate: string;
  contractor: string;
  inCharge: string;
  progress: number;
  observations: Observation[];
  recommendations: Recommendation[];
  participants?: Participant[];
  additionalDetails?: string;
  photos: string[];
  signatures: {
    inCharge?: string;
    engineer?: string;
    visitor?: string;
  };
  attachments?: string[];
  reportNumber?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  reserves?: Reserve[]; // Added reserves property
}

export interface Reserve {
  id: string;
  location: string;
  lot: string;
  description: string;
  photos?: string[];
  createdAt: string;
  resolvedAt?: string;
  annotationId?: string; 
}

export interface ArchitectInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  projectId: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

export interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectId: string;
}

export interface Participant {
  id: string;
  role: string;
  contact: string;
  address: string;
  email: string;
  phone: string;
  presence: "P" | "R" | "A" | "E";  // Ajout de "E" pour "Excusé"
}
