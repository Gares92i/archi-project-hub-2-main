
import { toast } from "sonner";
import { ProjectCardProps } from "@/components/ProjectCard";
import { addProjectToMember, removeProjectFromMember } from "./teamService";
import { addProjectToClient, removeProjectFromClient } from "./clientService";

// Récupérer les projets du localStorage ou utiliser les données par défaut
const loadProjectsFromStorage = (): ProjectCardProps[] => {
  const savedProjects = localStorage.getItem('projectsData');
  if (savedProjects) {
    try {
      return JSON.parse(savedProjects);
    } catch (error) {
      console.error("Erreur lors du chargement des projets depuis localStorage:", error);
      return getDefaultProjects();
    }
  }
  return getDefaultProjects();
};

// Sauvegarder les projets dans localStorage
const saveProjectsToStorage = (projects: ProjectCardProps[]) => {
  localStorage.setItem('projectsData', JSON.stringify(projects));
};

// Données par défaut pour les projets
const getDefaultProjects = (): ProjectCardProps[] => [
  {
    id: "1",
    name: "Villa Moderna",
    client: "Famille Martin",
    clientId: "1", // This is now valid with the updated interface
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
    clientId: "2", // This is now valid with the updated interface
    location: "Lyon, France",
    startDate: "2023-03-01",
    endDate: "2025-06-30",
    progress: 30,
    status: "design",
    teamSize: 12,
    imageUrl: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2",
    teamMembers: ["2"]
  }
];

// Initialiser les projets depuis localStorage ou utiliser les données par défaut
let projectsData: ProjectCardProps[] = loadProjectsFromStorage();

// Récupérer tous les projets
export const getAllProjects = async (): Promise<ProjectCardProps[]> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Projets récupérés:", projectsData.length);
      resolve([...projectsData]); // Retourne une copie pour éviter les problèmes de référence
    }, 300);
  });
};

// Récupérer un projet par ID
export const getProjectById = async (id: string): Promise<ProjectCardProps | null> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    const project = projectsData.find(p => p.id === id);
    setTimeout(() => resolve(project ? {...project} : null), 300); // Retourne une copie
  });
};

// Ajouter un nouveau projet
export const addProject = async (project: Omit<ProjectCardProps, "id">): Promise<ProjectCardProps> => {
  const newProject: ProjectCardProps = {
    ...project,
    id: Date.now().toString(), // Génération d'un ID unique
  };
  
  // S'assurer que tous les champs nécessaires sont présents
  if (!newProject.progress) newProject.progress = 0;
  if (!newProject.teamSize) newProject.teamSize = 0;
  if (!newProject.teamMembers) newProject.teamMembers = [];
  
  console.log("Ajout d'un nouveau projet:", newProject);
  
  projectsData = [...projectsData, newProject];
  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage
  
  // Ajouter le projet à chaque membre d'équipe associé
  if (newProject.teamMembers && newProject.teamMembers.length > 0) {
    for (const memberId of newProject.teamMembers) {
      await addProjectToMember(memberId, newProject.id);
    }
  }
  
  // Ajouter le projet au client
  if (newProject.clientId) {
    await addProjectToClient(newProject.clientId, newProject.id);
  }
  
  toast.success(`Projet "${newProject.name}" créé avec succès`);
  
  return {...newProject}; // Retourne une copie
};

// Mettre à jour un projet existant
export const updateProject = async (id: string, updates: Partial<ProjectCardProps>): Promise<ProjectCardProps> => {
  const projectIndex = projectsData.findIndex(project => project.id === id);
  
  if (projectIndex === -1) {
    throw new Error(`Projet avec l'ID ${id} non trouvé`);
  }
  
  const oldProject = projectsData[projectIndex];
  const updatedProject = { ...oldProject, ...updates };
  
  // Mettre à jour teamSize en fonction du nombre de membres d'équipe
  if (updates.teamMembers) {
    updatedProject.teamSize = updates.teamMembers.length;
    
    // Gérer les changements de membres d'équipe
    // Supprimer le projet des membres qui ne sont plus associés
    for (const memberId of oldProject.teamMembers || []) {
      if (!updatedProject.teamMembers.includes(memberId)) {
        await removeProjectFromMember(memberId, id);
      }
    }
    
    // Ajouter le projet aux nouveaux membres
    for (const memberId of updatedProject.teamMembers) {
      if (!(oldProject.teamMembers || []).includes(memberId)) {
        await addProjectToMember(memberId, id);
      }
    }
  }
  
  // Gérer le changement de client
  if (updates.clientId && oldProject.clientId !== updates.clientId) {
    // Supprimer le projet de l'ancien client
    if (oldProject.clientId) {
      await removeProjectFromClient(oldProject.clientId, id);
    }
    
    // Ajouter le projet au nouveau client
    await addProjectToClient(updates.clientId, id);
  }
  
  projectsData = [
    ...projectsData.slice(0, projectIndex),
    updatedProject,
    ...projectsData.slice(projectIndex + 1)
  ];
  
  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage
  
  console.log("Projet mis à jour:", updatedProject);
  toast.success(`Projet "${updatedProject.name}" mis à jour avec succès`);
  return {...updatedProject}; // Retourne une copie
};

// Supprimer un projet
export const deleteProject = async (id: string): Promise<boolean> => {
  const projectIndex = projectsData.findIndex(project => project.id === id);
  
  if (projectIndex === -1) {
    throw new Error(`Projet avec l'ID ${id} non trouvé`);
  }
  
  const project = projectsData[projectIndex];
  const projectName = project.name;
  
  // Supprimer le projet de tous les membres d'équipe associés
  if (project.teamMembers && project.teamMembers.length > 0) {
    for (const memberId of project.teamMembers) {
      await removeProjectFromMember(memberId, id);
    }
  }
  
  // Supprimer le projet du client
  if (project.clientId) {
    await removeProjectFromClient(project.clientId, id);
  }
  
  projectsData = [
    ...projectsData.slice(0, projectIndex),
    ...projectsData.slice(projectIndex + 1)
  ];
  
  saveProjectsToStorage(projectsData); // Sauvegarder dans localStorage
  
  console.log(`Projet "${projectName}" supprimé`);
  toast.success(`Projet "${projectName}" supprimé avec succès`);
  return true;
};
