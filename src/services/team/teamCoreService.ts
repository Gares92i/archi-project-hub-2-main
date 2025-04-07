
import { Team, TeamMember } from '@/types/team';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

// Clé de stockage localStorage
const TEAMS_STORAGE_KEY = 'user_teams';

// Charger les équipes depuis localStorage
const loadTeamsFromStorage = (userId: string): Team[] => {
  try {
    const storedData = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (storedData) {
      const allTeams = JSON.parse(storedData);
      // Filtrer les équipes pour l'utilisateur actuel
      return allTeams.filter((team: Team) => team.owner_id === userId);
    }
    return [];
  } catch (error) {
    console.error("Erreur lors du chargement des équipes depuis localStorage:", error);
    return [];
  }
};

// Sauvegarder les équipes dans localStorage
const saveTeamsToStorage = (teams: Team[]): void => {
  try {
    // Récupérer les équipes existantes d'abord
    const storedData = localStorage.getItem(TEAMS_STORAGE_KEY);
    let allTeams: Team[] = [];
    
    if (storedData) {
      // Récupérer toutes les équipes
      allTeams = JSON.parse(storedData);
      
      // Pour chaque nouvelle équipe, mettre à jour si elle existe ou l'ajouter
      teams.forEach(newTeam => {
        const existingIndex = allTeams.findIndex(team => team.id === newTeam.id);
        if (existingIndex >= 0) {
          allTeams[existingIndex] = newTeam;
        } else {
          allTeams.push(newTeam);
        }
      });
    } else {
      allTeams = teams;
    }
    
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(allTeams));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des équipes dans localStorage:", error);
  }
};

// Get all teams for a user
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch teams");
    }
    
    // Récupérer les équipes depuis localStorage
    const teams = loadTeamsFromStorage(userId);
    return teams;
  } catch (error) {
    console.error('Error in getUserTeams:', error);
    toast.error("Impossible de récupérer les équipes de l'utilisateur");
    return [];
  }
};

// Create a new team
export const createTeam = async (name: string, ownerId: string): Promise<Team> => {
  try {
    if (!name || !ownerId) {
      throw new Error("Team name and owner ID are required to create a team");
    }
    
    // Créer une nouvelle équipe
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name,
      owner_id: ownerId,
      subscription_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Sauvegarder dans localStorage
    saveTeamsToStorage([newTeam]);

    toast.success(`Équipe "${name}" créée avec succès`);
    return newTeam;
  } catch (error) {
    console.error('Error in createTeam:', error);
    toast.error("Impossible de créer l'équipe");
    
    // Return a temporary local team to allow the app to continue
    const tempTeam: Team = {
      id: crypto.randomUUID(),
      name,
      owner_id: ownerId,
      subscription_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return tempTeam;
  }
};

// Get a specific team by ID
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      throw new Error("Team ID is required");
    }
    
    // Récupérer toutes les équipes depuis localStorage
    const storedData = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (storedData) {
      const allTeams = JSON.parse(storedData);
      // Trouver l'équipe avec l'ID correspondant
      const team = allTeams.find((t: Team) => t.id === teamId);
      return team || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getTeamById:', error);
    toast.error("Impossible de récupérer les détails de l'équipe");
    return null;
  }
};

// Update a team
export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<Team> => {
  try {
    if (!teamId) {
      throw new Error("Team ID is required for update");
    }
    
    // Récupérer l'équipe actuelle
    const team = await getTeamById(teamId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }
    
    // Mettre à jour l'équipe
    const updatedTeam: Team = {
      ...team,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Sauvegarder dans localStorage
    saveTeamsToStorage([updatedTeam]);

    toast.success("Équipe mise à jour avec succès");
    return updatedTeam;
  } catch (error) {
    console.error('Error in updateTeam:', error);
    toast.error("Impossible de mettre à jour l'équipe");
    throw new Error("Failed to update team");
  }
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<boolean> => {
  try {
    if (!teamId) {
      throw new Error("Team ID is required for deletion");
    }
    
    // Récupérer toutes les équipes
    const storedData = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (storedData) {
      let allTeams = JSON.parse(storedData);
      
      // Filtrer pour supprimer l'équipe
      const teamExists = allTeams.some((t: Team) => t.id === teamId);
      if (!teamExists) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      allTeams = allTeams.filter((t: Team) => t.id !== teamId);
      
      // Sauvegarder les équipes mises à jour
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(allTeams));
    }

    toast.success("Équipe supprimée avec succès");
    return true;
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    toast.error("Impossible de supprimer l'équipe");
    throw new Error("Failed to delete team");
  }
};
