
import { toast } from "sonner";
import { getProjectById } from "@/components/services/projectService";
import { LegacyTeamMember, SupabaseTeamMember } from "@/types/team";
import { loadTeamMembersFromStorage, saveTeamMembersToStorage } from "./teamStorageUtils";
import { supabase } from "@/integrations/supabase/client";

// Initialize team members data
let teamMembersData: LegacyTeamMember[] = loadTeamMembersFromStorage();

// Get project names from IDs
export const getProjectNamesFromIds = async (projectIds: string[]): Promise<string[]> => {
  if (!projectIds || projectIds.length === 0) return [];
  
  try {
    const projectNames = [];
    for (const projectId of projectIds) {
      try {
        const project = await getProjectById(projectId);
        if (project) {
          projectNames.push(project.name);
        }
      } catch (error) {
        console.error(`Error retrieving project ${projectId}:`, error);
        // Continue with other projects even if one fails
      }
    }
    return projectNames;
  } catch (error) {
    console.error("Error retrieving project names:", error);
    toast.error("Impossible de récupérer les noms des projets");
    return [];
  }
};

// Add a project to a team member
export const addProjectToMember = async (memberId: string, projectId: string): Promise<LegacyTeamMember | null> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utiliser Supabase
      const { data, error } = await supabase
        .from('project_team_members')
        .insert({
          team_member_id: memberId,
          project_id: projectId
        })
        .select()
        .single();
      
      if (error) {
        // Si l'erreur est due à une contrainte unique, c'est que la relation existe déjà
        if (error.code === '23505') {
          // La relation existe déjà, ce n'est pas une erreur
          console.log("Le projet est déjà associé à ce membre");
          
          // Récupérer les détails du membre pour les retourner
          const { data: memberData, error: memberError } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', memberId)
            .single();
          
          if (memberError) {
            console.error("Erreur lors de la récupération du membre:", memberError);
            throw memberError;
          }
          
          const { data: projectLinks, error: projectError } = await supabase
            .from('project_team_members')
            .select('project_id')
            .eq('team_member_id', memberId);
          
          if (projectError) {
            console.error("Erreur lors de la récupération des projets:", projectError);
            throw projectError;
          }
          
          const memberProjects = projectLinks ? projectLinks.map(link => link.project_id) : [];
          
          const member = memberData as SupabaseTeamMember;
          
          return {
            id: member.id,
            name: member.name || `Membre ${member.id.slice(0, 5)}`,
            role: member.role || 'other',
            email: member.email || `membre-${member.id.slice(0, 5)}@exemple.fr`,
            phone: member.phone || '',
            projects: memberProjects,
            avatar: member.avatar || '',
            status: (member.status as "active" | "offline" | "busy") || "active"
          };
        }
        
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      toast.success("Projet ajouté au membre avec succès");
      
      // Récupérer les détails du membre pour les retourner
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', memberId)
        .single();
      
      if (memberError) {
        console.error("Erreur lors de la récupération du membre:", memberError);
        throw memberError;
      }
      
      const { data: projectLinks, error: projectError } = await supabase
        .from('project_team_members')
        .select('project_id')
        .eq('team_member_id', memberId);
      
      if (projectError) {
        console.error("Erreur lors de la récupération des projets:", projectError);
        throw projectError;
      }
      
      const memberProjects = projectLinks ? projectLinks.map(link => link.project_id) : [];
      
      const member = memberData as SupabaseTeamMember;
      
      return {
        id: member.id,
        name: member.name || `Membre ${member.id.slice(0, 5)}`,
        role: member.role || 'other',
        email: member.email || `membre-${member.id.slice(0, 5)}@exemple.fr`,
        phone: member.phone || '',
        projects: memberProjects,
        avatar: member.avatar || '',
        status: (member.status as "active" | "offline" | "busy") || "active"
      };
    }
    
    // Fallback: utiliser localStorage si l'utilisateur n'est pas connecté
    const memberIndex = teamMembersData.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) {
      toast.error(`Membre avec l'ID ${memberId} non trouvé`);
      return null;
    }
    
    const member = teamMembersData[memberIndex];
    
    // Check if the project is already assigned
    if (member.projects.includes(projectId)) {
      return member;
    }
    
    // Add the project
    const updatedMember = { 
      ...member, 
      projects: [...member.projects, projectId] 
    };
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      updatedMember,
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    toast.success("Projet ajouté au membre avec succès");
    
    return updatedMember;
    
  } catch (error) {
    console.error(`Error adding project ${projectId} to member ${memberId}:`, error);
    toast.error("Impossible d'ajouter le projet au membre");
    
    // Fallback: utiliser localStorage en cas d'erreur
    const memberIndex = teamMembersData.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) {
      return null;
    }
    
    const member = teamMembersData[memberIndex];
    
    // Check if the project is already assigned
    if (member.projects.includes(projectId)) {
      return member;
    }
    
    // Add the project
    const updatedMember = { 
      ...member, 
      projects: [...member.projects, projectId] 
    };
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      updatedMember,
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    return updatedMember;
  }
};

// Remove a project from a team member
export const removeProjectFromMember = async (memberId: string, projectId: string): Promise<LegacyTeamMember | null> => {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Utiliser Supabase
      const { error } = await supabase
        .from('project_team_members')
        .delete()
        .eq('team_member_id', memberId)
        .eq('project_id', projectId);
      
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      toast.success("Projet retiré du membre avec succès");
      
      // Récupérer les détails du membre pour les retourner
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', memberId)
        .single();
      
      if (memberError) {
        console.error("Erreur lors de la récupération du membre:", memberError);
        throw memberError;
      }
      
      const { data: projectLinks, error: projectError } = await supabase
        .from('project_team_members')
        .select('project_id')
        .eq('team_member_id', memberId);
      
      if (projectError) {
        console.error("Erreur lors de la récupération des projets:", projectError);
        throw projectError;
      }
      
      const memberProjects = projectLinks ? projectLinks.map(link => link.project_id) : [];
      
      const member = memberData as SupabaseTeamMember;
      
      return {
        id: member.id,
        name: member.name || `Membre ${member.id.slice(0, 5)}`,
        role: member.role || 'other',
        email: member.email || `membre-${member.id.slice(0, 5)}@exemple.fr`,
        phone: member.phone || '',
        projects: memberProjects,
        avatar: member.avatar || '',
        status: (member.status as "active" | "offline" | "busy") || "active"
      };
    }
    
    // Fallback: utiliser localStorage si l'utilisateur n'est pas connecté
    const memberIndex = teamMembersData.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) {
      toast.error(`Membre avec l'ID ${memberId} non trouvé`);
      return null;
    }
    
    const member = teamMembersData[memberIndex];
    
    // Remove the project
    const updatedMember = { 
      ...member, 
      projects: member.projects.filter(id => id !== projectId) 
    };
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      updatedMember,
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    toast.success("Projet retiré du membre avec succès");
    
    return updatedMember;
    
  } catch (error) {
    console.error(`Error removing project ${projectId} from member ${memberId}:`, error);
    toast.error("Impossible de retirer le projet du membre");
    
    // Fallback: utiliser localStorage en cas d'erreur
    const memberIndex = teamMembersData.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) {
      return null;
    }
    
    const member = teamMembersData[memberIndex];
    
    // Remove the project
    const updatedMember = { 
      ...member, 
      projects: member.projects.filter(id => id !== projectId) 
    };
    
    teamMembersData = [
      ...teamMembersData.slice(0, memberIndex),
      updatedMember,
      ...teamMembersData.slice(memberIndex + 1)
    ];
    
    saveTeamMembersToStorage(teamMembersData);
    return updatedMember;
  }
};
