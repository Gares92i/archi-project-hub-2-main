
import React from "react";
import { Sheet } from "@/components/ui/sheet";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { DeleteMemberConfirmDialog } from "@/components/team/DeleteMemberConfirmDialog";
import { TeamMember as LegacyTeamMember } from "@/services/team";

interface TeamMemberDialogsProps {
  isAddMemberSheetOpen: boolean;
  setIsAddMemberSheetOpen: (isOpen: boolean) => void;
  isEditMemberSheetOpen: boolean;
  setIsEditMemberSheetOpen: (isOpen: boolean) => void;
  confirmDeleteDialogOpen: boolean;
  setConfirmDeleteDialogOpen: (isOpen: boolean) => void;
  currentMember: LegacyTeamMember | null;
  handleCreateMember: (data: LegacyTeamMember) => Promise<void>;
  handleUpdateMember: (data: LegacyTeamMember) => Promise<void>;
  confirmDeleteMember: () => Promise<void>;
}

export const TeamMemberDialogs: React.FC<TeamMemberDialogsProps> = ({
  isAddMemberSheetOpen,
  setIsAddMemberSheetOpen,
  isEditMemberSheetOpen,
  setIsEditMemberSheetOpen,
  confirmDeleteDialogOpen,
  setConfirmDeleteDialogOpen,
  currentMember,
  handleCreateMember,
  handleUpdateMember,
  confirmDeleteMember
}) => {
  return (
    <>
      {/* Add member sheet */}
      <Sheet open={isAddMemberSheetOpen} onOpenChange={setIsAddMemberSheetOpen}>
        <TeamMemberForm 
          isEdit={false}
          teamId={null}
          onSubmit={handleCreateMember}
          onCancel={() => setIsAddMemberSheetOpen(false)}
        />
      </Sheet>

      {/* Edit member sheet */}
      <Sheet open={isEditMemberSheetOpen} onOpenChange={setIsEditMemberSheetOpen}>
        <TeamMemberForm 
          isEdit={true}
          member={currentMember || {}}
          teamId={null}
          onSubmit={handleUpdateMember}
          onCancel={() => setIsEditMemberSheetOpen(false)}
        />
      </Sheet>

      {/* Delete confirmation dialog */}
      <DeleteMemberConfirmDialog 
        isOpen={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        onConfirm={confirmDeleteMember}
      />
    </>
  );
};
