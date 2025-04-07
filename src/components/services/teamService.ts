
import { toast } from "sonner";
import { getProjectById } from "./projectService";
import { 
  loadTeamMembersFromStorage, 
  saveTeamMembersToStorage,
  getDefaultTeamMembers
} from "@/services/team/teamStorageUtils";
import { addProjectToMember, removeProjectFromMember } from "@/services/team/teamProjectsService";

// Type pour les membres de l'équipe
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  projects: string[];
  avatar?: string;
  status: "active" | "offline" | "busy";
}

// Initialiser les membres depuis localStorage ou utiliser les données par défaut
let teamMembersData: TeamMember[] = loadTeamMembersFromStorage();

// Récupérer tous les membres
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Membres récupérés:", teamMembersData.length);
      resolve([...teamMembersData]); // Retourne une copie pour éviter les problèmes de référence
    }, 300);
  });
};

// Ajouter un nouveau membre
export const addTeamMember = async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
  const newMember: TeamMember = {
    ...member,
    id: Date.now().toString(), // Génération d'un ID unique
  };
  
  teamMembersData = [...teamMembersData, newMember];
  saveTeamMembersToStorage(teamMembersData); // Sauvegarder dans localStorage
  
  toast.success(`Membre ajouté avec succès`);
  
  return {...newMember}; // Retourne une copie
};

// Mettre à jour un membre existant
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  const memberIndex = teamMembersData.findIndex(member => member.id === id);
  
  if (memberIndex === -1) {
    throw new Error(`Membre avec l'ID ${id} non trouvé`);
  }
  
  const updatedMember = { ...teamMembersData[memberIndex], ...updates };
  teamMembersData = [
    ...teamMembersData.slice(0, memberIndex),
    updatedMember,
    ...teamMembersData.slice(memberIndex + 1)
  ];
  
  saveTeamMembersToStorage(teamMembersData); // Sauvegarder dans localStorage
  
  toast.success(`Membre mis à jour avec succès`);
  return {...updatedMember}; // Retourne une copie
};

// Supprimer un membre
export const deleteTeamMember = async (id: string): Promise<boolean> => {
  const memberIndex = teamMembersData.findIndex(member => member.id === id);
  
  if (memberIndex === -1) {
    throw new Error(`Membre avec l'ID ${id} non trouvé`);
  }
  
  teamMembersData = [
    ...teamMembersData.slice(0, memberIndex),
    ...teamMembersData.slice(memberIndex + 1)
  ];
  
  saveTeamMembersToStorage(teamMembersData); // Sauvegarder dans localStorage
  
  toast.success(`Membre supprimé avec succès`);
  return true;
};

// Récupérer les noms de projets à partir des IDs de projets
export const getProjectNamesFromIds = async (projectIds: string[]): Promise<string[]> => {
  if (!projectIds || projectIds.length === 0) return [];
  
  try {
    const projectNames = [];
    for (const projectId of projectIds) {
      const project = await getProjectById(projectId);
      if (project) {
        projectNames.push(project.name);
      }
    }
    return projectNames;
  } catch (error) {
    console.error("Erreur lors de la récupération des noms de projets:", error);
    return [];
  }
};

// Export existing functions from the new team services to maintain backward compatibility
export { addProjectToMember, removeProjectFromMember };
