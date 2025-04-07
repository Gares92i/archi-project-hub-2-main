
import { toast } from "sonner";
import { getProjectById } from "@/components/services/projectService";
import { 
  loadTeamMembersFromStorage, 
  saveTeamMembersToStorage,
  getDefaultTeamMembers
} from "@/services/team/teamStorageUtils";
import { addProjectToMember, removeProjectFromMember } from "@/services/team/teamProjectsService";
import { supabase } from "@/integrations/supabase/client";
import { LegacyTeamMember, SupabaseTeamMember } from "@/types/team";

// Initialiser les membres depuis localStorage ou utiliser les données par défaut
let teamMembersData: LegacyTeamMember[] = loadTeamMembersFromStorage();

// Si aucune donnée n'est trouvée dans le localStorage, utiliser les données par défaut
if (teamMembersData.length === 0) {
  teamMembersData = getDefaultTeamMembers();
  saveTeamMembersToStorage(teamMembersData);
}

// Récupérer tous les membres
export const getAllTeamMembers = async (): Promise<LegacyTeamMember[]> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utiliser Supabase
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      // Convertir le format Supabase vers le format de l'application
      if (data && data.length > 0) {
        // Pour chaque membre, récupérer ses projets et adapter les données
        const membersWithProjects = await Promise.all(data.map(async (member: SupabaseTeamMember) => {
          const { data: projectLinks, error: projectError } = await supabase
            .from('project_team_members')
            .select('project_id')
            .eq('team_member_id', member.id);
          
          if (projectError) {
            console.error("Erreur lors de la récupération des projets:", projectError);
            return {
              id: member.id,
              name: member.name || `Membre ${member.id.slice(0, 5)}`,
              role: member.role || 'other',
              email: member.email || `membre-${member.id.slice(0, 5)}@exemple.fr`,
              phone: member.phone || '',
              projects: [],
              avatar: member.avatar || '',
              status: (member.status as "active" | "offline" | "busy") || "active"
            } as LegacyTeamMember;
          }
          
          return {
            id: member.id,
            name: member.name || `Membre ${member.id.slice(0, 5)}`,
            role: member.role || 'other',
            email: member.email || `membre-${member.id.slice(0, 5)}@exemple.fr`,
            phone: member.phone || '',
            projects: projectLinks ? projectLinks.map(link => link.project_id) : [],
            avatar: member.avatar || '',
            status: (member.status as "active" | "offline" | "busy") || "active"
          } as LegacyTeamMember;
        }));
        
        return membersWithProjects;
      }
      
      // Si aucune donnée n'est trouvée dans Supabase, retourner les données locales
      console.log("Aucune donnée trouvée dans Supabase, utilisation des données locales");
    }
    
    // Fallback: utiliser les données locales si l'utilisateur n'est pas connecté
    // ou si Supabase ne retourne pas de données
    return [...teamMembersData];
    
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    // En cas d'erreur, utiliser les données locales
    return [...teamMembersData];
  }
};

// Ajouter un nouveau membre
export const addLegacyTeamMember = async (member: Omit<LegacyTeamMember, "id">): Promise<LegacyTeamMember> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utiliser Supabase
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          team_id: user.id, // Utiliser l'ID utilisateur comme ID d'équipe par défaut
          role: member.role,
          name: member.name,
          email: member.email,
          phone: member.phone,
          avatar: member.avatar,
          status: member.status
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      const newMember: LegacyTeamMember = {
        id: data.id,
        name: data.name || member.name,
        role: data.role || member.role,
        email: data.email || member.email,
        phone: data.phone || member.phone || '',
        projects: [],
        avatar: data.avatar || member.avatar,
        status: (data.status as "active" | "offline" | "busy") || member.status
      };
      
      // Ajouter les projets au membre
      if (member.projects && member.projects.length > 0) {
        for (const projectId of member.projects) {
          await addProjectToMember(newMember.id, projectId);
        }
      }
      
      toast.success(`Membre ajouté avec succès`);
      return newMember;
    }
    
    // Fallback: utiliser localStorage si l'utilisateur n'est pas connecté
    const newMember: LegacyTeamMember = {
      ...member,
      id: Date.now().toString()
    };
    
    teamMembersData = [...teamMembersData, newMember];
    saveTeamMembersToStorage(teamMembersData);
    
    toast.success(`Membre ajouté avec succès`);
    return {...newMember};
    
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    toast.error("Erreur lors de l'ajout du membre");
    
    // Fallback: utiliser localStorage en cas d'erreur
    const newMember: LegacyTeamMember = {
      ...member,
      id: Date.now().toString()
    };
    
    teamMembersData = [...teamMembersData, newMember];
    saveTeamMembersToStorage(teamMembersData);
    
    return {...newMember};
  }
};

// Mettre à jour un membre existant
export const updateLegacyTeamMember = async (id: string, updates: Partial<LegacyTeamMember>): Promise<LegacyTeamMember> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Préparer les données à mettre à jour
      const updateData: any = {
        name: updates.name,
        role: updates.role,
        email: updates.email,
        phone: updates.phone,
        avatar: updates.avatar,
        status: updates.status
      };
      
      // Filtrer les champs undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      // Utiliser Supabase pour la mise à jour
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      // Obtenir les projets actuels du membre
      const { data: projectLinks, error: projectError } = await supabase
        .from('project_team_members')
        .select('project_id')
        .eq('team_member_id', id);
      
      if (projectError) {
        console.error("Erreur lors de la récupération des projets:", projectError);
        throw projectError;
      }
      
      const currentProjects = projectLinks ? projectLinks.map(link => link.project_id) : [];
      
      // Mettre à jour les projets si nécessaire
      if (updates.projects) {
        // Supprimer les projets qui ne sont plus associés
        for (const projectId of currentProjects) {
          if (!updates.projects.includes(projectId)) {
            await removeProjectFromMember(id, projectId);
          }
        }
        
        // Ajouter les nouveaux projets
        for (const projectId of updates.projects) {
          if (!currentProjects.includes(projectId)) {
            await addProjectToMember(id, projectId);
          }
        }
      }
      
      const updatedMember: LegacyTeamMember = {
        id: data.id,
        name: data.name || 'Sans nom',
        role: data.role || 'other',
        email: data.email || 'email@exemple.fr',
        phone: data.phone || '',
        projects: updates.projects || currentProjects,
        avatar: data.avatar || '',
        status: (data.status as "active" | "offline" | "busy") || "active"
      };
      
      toast.success(`Membre mis à jour avec succès`);
      return updatedMember;
    }
    
    // Fallback: utiliser localStorage si l'utilisateur n'est pas connecté
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
    
    saveTeamMembersToStorage(teamMembersData);
    
    toast.success(`Membre mis à jour avec succès`);
    return {...updatedMember};
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);
    toast.error("Erreur lors de la mise à jour du membre");
    
    // Fallback: utiliser localStorage en cas d'erreur
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
    
    saveTeamMembersToStorage(teamMembersData);
    return {...updatedMember};
  }
};

// Supprimer un membre
export const deleteTeamMember = async (id: string): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utiliser Supabase
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      toast.success(`Membre supprimé avec succès`);
      return true;
    }
    
    // Fallback: utiliser localStorage si l'utilisateur n'est pas connecté
    const memberIndex = teamMembersData.findIndex(member => member.id === id);
    
    if (memberIndex === -1) {
      throw new Error(`Membre avec l'ID ${id} non trouvé`);
    }
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    
    toast.success(`Membre supprimé avec succès`);
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error);
    toast.error("Erreur lors de la suppression du membre");
    
    // Fallback: utiliser localStorage en cas d'erreur
    const memberIndex = teamMembersData.findIndex(member => member.id === id);
    
    if (memberIndex === -1) {
      throw new Error(`Membre avec l'ID ${id} non trouvé`);
    }
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    return true;
  }
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

// Export type definition
export type { LegacyTeamMember as TeamMember };

// Export existing functions from the new team services to maintain backward compatibility
export { addProjectToMember, removeProjectFromMember };
