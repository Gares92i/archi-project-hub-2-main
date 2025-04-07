
import React, { useMemo } from "react";
import { useTeamMemberManager } from "@/hooks/useTeamMemberManager";
import { useTeamFilter } from "@/hooks/useTeamFilter";
import { TeamMemberFilters } from "@/components/team/TeamMemberFilters";
import { TeamMemberDialogs } from "@/components/team/TeamMemberDialogs";
import { TeamMemberTabs } from "@/components/team/TeamMemberTabs";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const TeamMemberManager: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si l'utilisateur n'est pas authentifié, afficher un message et rediriger
  if (!isAuthenticated) {
    return (
      <Card className="w-full p-6">
        <CardContent className="pt-6 flex flex-col items-center">
          <p className="text-center mb-4">
            Vous devez être connecté pour accéder à la gestion d'équipe.
          </p>
          <Button onClick={() => navigate("/auth")}>Se connecter</Button>
        </CardContent>
      </Card>
    );
  }

  const {
    membersData,
    isLoading,
    adaptMembersForFilter,
    isAddMemberSheetOpen,
    setIsAddMemberSheetOpen,
    openAddMemberSheet,
    closeAddMemberSheet,
    isEditMemberSheetOpen,
    setIsEditMemberSheetOpen,
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    currentMember,
    handleEditMember,
    handleDeleteMember,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember
  } = useTeamMemberManager();
  
  // Simplifier la logique d'adaptation en utilisant directement useMemo
  const adaptedMembers = useMemo(() => 
    adaptMembersForFilter(membersData), 
    [membersData, adaptMembersForFilter]
  );

  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    filteredMembers 
  } = useTeamFilter(adaptedMembers);

  return (
    <>
      {/* Filters and search */}
      <TeamMemberFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddMember={openAddMemberSheet}
      />

      {/* Team members list */}
      <TeamMemberTabs 
        activeTab={activeTab}
        filteredMembers={filteredMembers}
        isLoading={isLoading}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      {/* Dialogs and sheets */}
      <TeamMemberDialogs 
        isAddMemberSheetOpen={isAddMemberSheetOpen}
        setIsAddMemberSheetOpen={setIsAddMemberSheetOpen}
        isEditMemberSheetOpen={isEditMemberSheetOpen}
        setIsEditMemberSheetOpen={setIsEditMemberSheetOpen}
        confirmDeleteDialogOpen={confirmDeleteDialogOpen}
        setConfirmDeleteDialogOpen={setConfirmDeleteDialogOpen}
        currentMember={currentMember}
        handleCreateMember={handleCreateMember}
        handleUpdateMember={handleUpdateMember}
        confirmDeleteMember={confirmDeleteMember}
      />
    </>
  );
};
