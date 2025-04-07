
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
