
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAllTeamMembers, addLegacyTeamMember, updateLegacyTeamMember, deleteTeamMember } from "@/services/team/legacyTeamService";
import { getUserTeams, createTeam } from "@/services/team/teamCoreService";
import { useProfile } from "@/hooks/useProfile";
import { TeamMember, LegacyTeamMember } from "@/types/team";
import { UserRole } from "@/types/auth";

export const useTeamMembers = () => {
  const [membersData, setMembersData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const { profile } = useProfile();

  // Load teams and members
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      try {
        setIsLoading(true);
        // Get user teams
        let activeTeamId: string | null = null;
        
        try {
          const teams = await getUserTeams(profile.id);
          
          // If user has no team, create one
          if (teams.length === 0) {
            try {
              const newTeam = await createTeam("Mon Équipe", profile.id);
              activeTeamId = newTeam.id;
              toast.success("Une équipe a été créée pour vous");
            } catch (teamCreateError) {
              console.error("Erreur lors de la création d'équipe :", teamCreateError);
              
              // Use localStorage to create a temporary team ID
              activeTeamId = localStorage.getItem('tempTeamId') || crypto.randomUUID();
              localStorage.setItem('tempTeamId', activeTeamId);
            }
          } else {
            activeTeamId = teams[0].id;
          }
        } catch (teamsError) {
          console.error("Erreur lors de la récupération des équipes :", teamsError);
          
          // Use localStorage to create a temporary team ID
          activeTeamId = localStorage.getItem('tempTeamId') || crypto.randomUUID();
          localStorage.setItem('tempTeamId', activeTeamId);
        }
        
        setTeamId(activeTeamId);
        
        // Charger tous les membres en utilisant le service legacy
        try {
          const members = await getAllTeamMembers();
          setMembersData(members as unknown as TeamMember[]);
        } catch (membersError) {
          console.error("Erreur lors de la récupération des membres :", membersError);
          setMembersData([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        toast.error("Impossible de charger les membres de l'équipe");
        setMembersData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile]);

  // Create a new team member
  const createMember = async (data: { user_id: string; role: UserRole; team_id: string | null }) => {
    if (!data.user_id || !data.role) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      // Utiliser le service legacy pour ajouter un membre
      // Fix: Remove the 'id' property as it's excluded in the addLegacyTeamMember parameter type
      await addLegacyTeamMember({
        name: data.user_id.split('@')[0] || 'Nouveau membre',
        role: data.role,
        email: data.user_id,
        phone: '',
        projects: [],
        status: "active" // Fix: Explicitly use a valid literal status value
      });
      
      // Recharger les membres
      const updatedMembers = await getAllTeamMembers();
      setMembersData(updatedMembers as unknown as TeamMember[]);
      
      toast.success("Membre ajouté avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre :", error);
      toast.error("Impossible d'ajouter le membre");
      return false;
    }
  };

  // Update an existing team member
  const updateMember = async (currentMember: TeamMember, data: { role: UserRole }) => {
    if (!currentMember || !data.role) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    
    try {
      // Adapter pour le service legacy
      const legacyMember: LegacyTeamMember = {
        id: currentMember.id,
        name: currentMember.profile?.first_name + ' ' + (currentMember.profile?.last_name || ''),
        role: data.role,
        email: currentMember.profile?.email || '',
        phone: currentMember.profile?.title || '',
        projects: [],
        avatar: currentMember.profile?.avatar_url,
        status: "active" // Fix: Explicitly use a valid literal status value
      };

      // Utiliser le service legacy pour mettre à jour
      await updateLegacyTeamMember(currentMember.id, legacyMember);
      
      // Recharger les membres
      const updatedMembers = await getAllTeamMembers();
      setMembersData(updatedMembers as unknown as TeamMember[]);
      
      toast.success("Membre mis à jour avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du membre :", error);
      toast.error("Impossible de mettre à jour le membre");
      return false;
    }
  };

  // Delete a team member
  const deleteMember = async (currentMember: TeamMember) => {
    if (!currentMember) return false;
    
    try {
      // Utiliser le service legacy pour supprimer
      await deleteTeamMember(currentMember.id);
      
      // Recharger les membres
      const updatedMembers = await getAllTeamMembers();
      setMembersData(updatedMembers as unknown as TeamMember[]);
      
      toast.success("Membre supprimé avec succès");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
      toast.error("Impossible de supprimer le membre");
      return false;
    }
  };

  return {
    membersData,
    isLoading,
    teamId,
    createMember,
    updateMember,
    deleteMember
  };
};
