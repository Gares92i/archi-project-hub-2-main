
import { TeamMember } from "@/types/team";
import { useTeamMemberAdapter } from "./team/useTeamMemberAdapter";
import { useTeamMemberOperations } from "./team/useTeamMemberOperations";
import { useTeamMemberUIState } from "./team/useTeamMemberUIState";

export const useTeamMemberManager = () => {
  const { adaptMembersForFilter } = useTeamMemberAdapter();
  
  const {
    membersData,
    isLoading,
    teamId,
    currentMember,
    setCurrentMember,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember
  } = useTeamMemberOperations();

  const {
    isAddMemberSheetOpen,
    setIsAddMemberSheetOpen,
    openAddMemberSheet,
    closeAddMemberSheet,
    isEditMemberSheetOpen,
    setIsEditMemberSheetOpen,
    openEditMemberSheet,
    closeEditMemberSheet,
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    openDeleteMemberDialog,
    closeDeleteMemberDialog,
    selectedMember,
    setSelectedMember,
    convertToLegacyMember
  } = useTeamMemberUIState();

  // Handler for editing a team member
  const handleEditMember = (member: TeamMember) => {
    try {
      if ('user_id' in member && member.user_id !== "legacy") {
        // Convert Supabase member to LegacyTeamMember for editing
        setCurrentMember(convertToLegacyMember(member));
      } else {
        // For a legacy member
        const legacyMember = membersData.find(m => m.id === member.id);
        if (legacyMember) {
          setCurrentMember(legacyMember as unknown as import("@/services/team").TeamMember);
        }
      }
      openEditMemberSheet(member);
    } catch (error) {
      console.error("Error preparing member for edit:", error);
    }
  };

  // Handler for deleting a team member
  const handleDeleteMember = (member: TeamMember) => {
    try {
      if ('user_id' in member && member.user_id !== "legacy") {
        // Convert Supabase member to LegacyTeamMember for deletion
        setCurrentMember(convertToLegacyMember(member));
      } else {
        // For a legacy member
        const legacyMember = membersData.find(m => m.id === member.id);
        if (legacyMember) {
          setCurrentMember(legacyMember as unknown as import("@/services/team").TeamMember);
        }
      }
      openDeleteMemberDialog(member);
    } catch (error) {
      console.error("Error preparing member for deletion:", error);
    }
  };

  return {
    membersData,
    isLoading,
    adaptMembersForFilter,
    isAddMemberSheetOpen,
    setIsAddMemberSheetOpen,
    openAddMemberSheet,
    closeAddMemberSheet,
    isEditMemberSheetOpen,
    setIsEditMemberSheetOpen,
    openEditMemberSheet,
    closeEditMemberSheet,
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    openDeleteMemberDialog,
    closeDeleteMemberDialog,
    selectedMember,
    currentMember,
    handleEditMember,
    handleDeleteMember,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember
  };
};
