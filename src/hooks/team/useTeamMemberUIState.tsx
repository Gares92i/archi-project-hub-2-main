
import { useState } from "react";
import { TeamMember } from "@/types/team";
import { useTeamMemberAdapter } from "./useTeamMemberAdapter";

export const useTeamMemberUIState = () => {
  const [isAddMemberSheetOpen, setIsAddMemberSheetOpen] = useState(false);
  const [isEditMemberSheetOpen, setIsEditMemberSheetOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  const { convertToLegacyMember } = useTeamMemberAdapter();

  // Reset UI state when closing dialogs
  const resetUIState = () => {
    setSelectedMember(null);
  };

  // Enhanced open/close handlers
  const openAddMemberSheet = () => {
    resetUIState();
    setIsAddMemberSheetOpen(true);
  };

  const closeAddMemberSheet = () => {
    setIsAddMemberSheetOpen(false);
    resetUIState();
  };

  const openEditMemberSheet = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditMemberSheetOpen(true);
  };

  const closeEditMemberSheet = () => {
    setIsEditMemberSheetOpen(false);
    resetUIState();
  };

  const openDeleteMemberDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setConfirmDeleteDialogOpen(true);
  };

  const closeDeleteMemberDialog = () => {
    setConfirmDeleteDialogOpen(false);
    resetUIState();
  };

  return {
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
    convertToLegacyMember,
    resetUIState
  };
};
