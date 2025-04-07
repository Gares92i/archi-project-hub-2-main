
import { TeamMember as LegacyTeamMember } from "@/services/team";
import { TeamMember } from "@/types/team";
import { UserRole } from "@/types/auth";

export const useTeamMemberAdapter = () => {
  // Adapter for converting LegacyTeamMember[] to TeamMember[]
  const adaptMembersForFilter = (members: LegacyTeamMember[] | TeamMember[]): TeamMember[] => {
    return members.map(member => {
      // If it's already a TeamMember from Supabase
      if ('team_id' in member) {
        return member as TeamMember;
      }
      
      // If it's a LegacyTeamMember, convert it to TeamMember
      const legacyMember = member as LegacyTeamMember;
      return {
        id: legacyMember.id,
        team_id: "legacy",
        user_id: "legacy",
        role: legacyMember.role as UserRole,
        created_at: new Date().toISOString(),
        profile: {
          id: legacyMember.id,
          first_name: legacyMember.name.split(' ')[0],
          last_name: legacyMember.name.split(' ').slice(1).join(' '),
          email: legacyMember.email,
          title: legacyMember.phone,
          company: "",
          avatar_url: legacyMember.avatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };
    });
  };

  // Convert TeamMember to LegacyTeamMember for editing
  const convertToLegacyMember = (member: TeamMember): LegacyTeamMember => {
    if ('user_id' in member && member.user_id !== "legacy") {
      // For a Supabase member, convert to LegacyTeamMember
      return {
        id: member.id,
        name: member.profile?.first_name + ' ' + (member.profile?.last_name || ''),
        role: member.role,
        email: member.profile?.email || '',
        phone: member.profile?.title || '',
        projects: [],
        avatar: member.profile?.avatar_url,
        status: "active"
      };
    }
    
    throw new Error("Invalid member format for conversion");
  };

  return {
    adaptMembersForFilter,
    convertToLegacyMember
  };
};
