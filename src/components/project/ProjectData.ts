
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";
import { ProjectCardProps } from "@/components/ProjectCard";

export const projectsData: ProjectCardProps[] = [
  {
    id: "1",
    name: "Villa Moderna",
    client: "Famille Martin",
    clientId: "1", // Added clientId to match updated interface
    location: "Aix-en-Provence, France",
    startDate: "2023-01-15",
    endDate: "2023-12-30",
    progress: 75,
    status: "construction",
    teamSize: 6,
    imageUrl: "https://images.unsplash.com/photo-1493397212122-2b85dda8106b",
    teamMembers: ["1"]
  },
  {
    id: "2",
    name: "Tour Horizon",
    client: "Groupe Immobilier Altitude",
    clientId: "2", // Added clientId to match updated interface
    location: "Lyon, France",
    startDate: "2023-03-01",
    endDate: "2025-06-30",
    progress: 30,
    status: "design",
    teamSize: 12,
    imageUrl: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2",
    teamMembers: ["2"]
  },
  {
    id: "3",
    name: "Résidence Eterna",
    client: "Coopérative Habitat Plus",
    clientId: "3", // Added clientId to match updated interface
    location: "Bordeaux, France",
    startDate: "2022-11-10",
    endDate: "2024-04-15",
    progress: 90,
    status: "construction",
    teamSize: 8,
  },
  {
    id: "4",
    name: "Centre Commercial Lumina",
    client: "Investissements Urbains SA",
    clientId: "4", // Added clientId to match updated interface
    location: "Lille, France",
    startDate: "2023-05-01",
    endDate: "2025-09-30",
    progress: 10,
    status: "planning",
    teamSize: 15,
  },
  {
    id: "5",
    name: "Bureaux Panorama",
    client: "Tech Innovations Inc.",
    clientId: "5", // Added clientId to match updated interface
    location: "Paris, France",
    startDate: "2023-02-15",
    endDate: "2024-08-20",
    progress: 45,
    status: "design",
    teamSize: 9,
  },
  {
    id: "6",
    name: "École Futura",
    client: "Ministère de l'Éducation",
    clientId: "6", // Added clientId to match updated interface
    location: "Nantes, France",
    startDate: "2023-07-01",
    endDate: "2025-01-10",
    progress: 5,
    status: "planning",
    teamSize: 11,
  },
  {
    id: "7",
    name: "Hôtel Riviera",
    client: "Groupe Hospitalité Luxe",
    clientId: "7", // Added clientId to match updated interface
    location: "Nice, France",
    startDate: "2022-09-15",
    endDate: "2024-05-30",
    progress: 65,
    status: "construction",
    teamSize: 14,
  },
  {
    id: "8",
    name: "Complexe Sportif Olympia",
    client: "Ville de Marseille",
    clientId: "8", // Added clientId to match updated interface
    location: "Marseille, France",
    startDate: "2023-04-01",
    endDate: "2025-03-15",
    progress: 20,
    status: "design",
    teamSize: 10,
  },
];

export const teamMembers = [
  { id: "1", name: "Sophie Laurent", role: "Architecte principal", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: "2", name: "Thomas Dubois", role: "Ingénieur structure", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: "3", name: "Marie Lefevre", role: "Designer d'intérieur", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: "4", name: "Jean Moreau", role: "Chef de projet", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: "5", name: "Camille Bernard", role: "Architecte paysagiste", avatar: "https://i.pravatar.cc/150?u=5" },
];

export const projectTasks: Task[] = [
  { 
    id: "task1", 
    title: "Finaliser les plans d'étage", 
    name: "Finaliser les plans d'étage", 
    start: "2023-03-01", 
    end: "2023-03-15", 
    progress: 1.0,
    projectName: "Villa Moderna",
    dueDate: "2023-03-15",
    priority: "high",
    completed: true
  },
  { 
    id: "task2", 
    title: "Soumettre les demandes de permis", 
    name: "Soumettre les demandes de permis", 
    start: "2023-04-01", 
    end: "2023-04-20", 
    progress: 0.5,
    projectName: "Villa Moderna",
    dueDate: "2023-04-20",
    priority: "high",
    completed: false
  },
  { 
    id: "task3", 
    title: "Sélectionner les matériaux de façade", 
    name: "Sélectionner les matériaux de façade", 
    start: "2023-04-25", 
    end: "2023-05-10", 
    progress: 0.3,
    projectName: "Villa Moderna",
    dueDate: "2023-05-10",
    priority: "medium",
    completed: false
  },
  { 
    id: "task4", 
    title: "Réviser le budget de construction", 
    name: "Réviser le budget de construction", 
    start: "2023-05-15", 
    end: "2023-05-30", 
    progress: 0.0,
    projectName: "Villa Moderna",
    dueDate: "2023-05-30",
    priority: "medium",
    completed: false
  },
  { 
    id: "task5", 
    title: "Planifier la réunion avec les clients", 
    name: "Planifier la réunion avec les clients", 
    start: "2023-06-01", 
    end: "2023-06-15", 
    progress: 0.0,
    projectName: "Villa Moderna",
    dueDate: "2023-06-15",
    priority: "low",
    completed: false
  }
];

export const projectDocuments: Document[] = [
  { 
    id: "doc1", 
    name: "Plans_architecturaux_v2.pdf", 
    type: "pdf", 
    size: "8.5 MB", 
    date: "2023-03-10",
    projectName: "Villa Moderna",
    uploadDate: "2023-03-10",
    projectId: "1"
  },
  { 
    id: "doc2", 
    name: "Budget_prévisionnel.xlsx", 
    type: "xls", 
    size: "1.2 MB", 
    date: "2023-02-28",
    projectName: "Villa Moderna",
    uploadDate: "2023-02-28",
    projectId: "1"
  },
  { 
    id: "doc3", 
    name: "Rendus_3D_facade.jpg", 
    type: "img", 
    size: "5.7 MB", 
    date: "2023-03-15",
    projectName: "Villa Moderna",
    uploadDate: "2023-03-15",
    projectId: "1"
  },
  { 
    id: "doc4", 
    name: "Contrat_client_signé.pdf", 
    type: "pdf", 
    size: "3.1 MB", 
    date: "2023-01-20",
    projectName: "Villa Moderna", 
    uploadDate: "2023-01-20",
    projectId: "1"
  },
  { 
    id: "doc5", 
    name: "Calendrier_travaux.xlsx", 
    type: "xls", 
    size: "0.9 MB", 
    date: "2023-03-05",
    projectName: "Villa Moderna",
    uploadDate: "2023-03-05",
    projectId: "1"
  },
];

export const projectMilestones = [
  { id: "m1", title: "Approbation des plans", date: "2023-02-15", completed: true, projectId: "1" },
  { id: "m2", title: "Obtention du permis de construire", date: "2023-05-20", completed: false, projectId: "1" },
  { id: "m3", title: "Début des travaux de fondation", date: "2023-07-10", completed: false, projectId: "1" },
  { id: "m4", title: "Achèvement du gros oeuvre", date: "2023-10-30", completed: false, projectId: "1" },
  { id: "m5", title: "Finitions intérieures", date: "2023-11-25", completed: false, projectId: "1" },
  { id: "m6", title: "Livraison au client", date: "2023-12-20", completed: false, projectId: "1" },
];

export const projectStats = {
  budgetTotal: 750000,
  budgetUsed: 425000,
  timelineProgress: 58,
  tasksCompleted: 12,
  tasksInProgress: 8,
  tasksTodo: 15,
  documentsCount: 24,
  commentsCount: 37,
  meetingsCount: 8,
  projectId: "1"
};
