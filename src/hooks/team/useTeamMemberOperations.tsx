
import { useState, useCallback } from "react";
import { TeamMember as LegacyTeamMember } from "@/services/team";
import { TeamMember } from "@/types/team";
import { UserRole } from "@/types/auth";
import { toast } from "sonner";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export const useTeamMemberOperations = () => {
  const [currentMember, setCurrentMember] = useState<LegacyTeamMember | null>(null);
  
  const { 
    membersData, 
    isLoading, 
    teamId,
    createMember,
    updateMember: updateSupabaseMember,
    deleteMember: deleteSupabaseMember
  } = useTeamMembers();

  // Handler for creating a new team member
  const handleCreateMember = useCallback(async (data: LegacyTeamMember): Promise<void> => {
    try {
      if (teamId) {
        // If we have a teamId, use Supabase
        const result = await createMember({
          user_id: data.email, // Use email as user_id for invitation
          role: data.role as UserRole, 
          team_id: teamId
        });
        if (result) {
          toast.success("Membre ajouté avec succès");
        }
      } else {
        // Otherwise use localStorage
        await import("@/services/team").then(({ addLegacyTeamMember }) => {
          addLegacyTeamMember(data);
        });
        toast.success("Membre ajouté avec succès");
      }
    } catch (error) {
      console.error("Error creating team member:", error);
      toast.error("Erreur lors de la création du membre");
    }
  }, [teamId, createMember]);

  // Handler for updating a team member
  const handleUpdateMember = useCallback(async (data: LegacyTeamMember): Promise<void> => {
    if (!currentMember) return;
    
    try {
      if (teamId && 'user_id' in currentMember) {
        // If we have a teamId and it's a Supabase member
        const memberToUpdate = {
          id: currentMember.id,
          team_id: teamId,
          user_id: (currentMember as unknown as Record<string, unknown>).user_id as string,
          role: data.role as UserRole,
          created_at: new Date().toISOString()
        } as unknown as TeamMember;
        
        const result = await updateSupabaseMember(memberToUpdate, { 
          role: data.role as UserRole 
        });
        
        if (result) {
          toast.success("Membre mis à jour avec succès");
        }
      } else {
        // Otherwise use localStorage
        await import("@/services/team").then(({ updateLegacyTeamMember }) => {
          updateLegacyTeamMember(data.id, data);
        });
        toast.success("Membre mis à jour avec succès");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Erreur lors de la mise à jour du membre");
    }
  }, [currentMember, teamId, updateSupabaseMember]);

  // Handler for confirming deletion of a team member
  const confirmDeleteMember = useCallback(async (): Promise<void> => {
    if (!currentMember) return;
    
    try {
      if (teamId && 'user_id' in currentMember) {
        // If we have a teamId and it's a Supabase member
        const memberToDelete = {
          id: currentMember.id,
          team_id: teamId,
          user_id: (currentMember as unknown as Record<string, unknown>).user_id as string,
          role: currentMember.role as UserRole,
          created_at: new Date().toISOString()
        } as unknown as TeamMember;
        
        const result = await deleteSupabaseMember(memberToDelete);
        
        if (result) {
          toast.success("Membre supprimé avec succès");
        }
      } else {
        // Otherwise use localStorage
        await import("@/services/team").then(({ deleteTeamMember }) => {
          deleteTeamMember(currentMember.id);
        });
        toast.success("Membre supprimé avec succès");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Erreur lors de la suppression du membre");
    }
  }, [currentMember, teamId, deleteSupabaseMember]);

  return {
    membersData,
    isLoading,
    teamId,
    currentMember,
    setCurrentMember,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember
  };
};
