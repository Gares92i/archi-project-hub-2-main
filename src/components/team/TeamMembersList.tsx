
import { TeamMember } from "@/types/team";
import { TeamMemberCard } from "./TeamMemberCard";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

interface TeamMembersListProps {
  members: TeamMember[];
  isLoading: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export const TeamMembersList = ({ 
  members, 
  isLoading, 
  onEdit, 
  onDelete 
}: TeamMembersListProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (members.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
