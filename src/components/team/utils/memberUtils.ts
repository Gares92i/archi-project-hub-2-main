
import { TeamMember } from "@/types/team";

// Helper function to get default avatar color
export const getDefaultAvatar = (name: string) => {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", 
    "bg-yellow-500", "bg-purple-500", "bg-pink-500"
  ];
  
  // Use the first letter of the name as index to choose a color
  const colorIndex = name.charCodeAt(0) % colors.length;
  return colors[colorIndex];
};

// Helper function to get initials from name
export const getInitials = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to get member name
export const getMemberName = (member: TeamMember) => {
  // Ensure profile is an object, and safely access properties
  const firstName = member.profile?.first_name || '';
  const lastName = member.profile?.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Utilisateur inconnu';
};

// Helper function to get member email
export const getMemberEmail = (member: TeamMember) => {
  return member.profile?.email || '';
};

// Helper function to get member phone/title
export const getMemberPhone = (member: TeamMember) => {
  return member.profile?.title || '';
};

// Helper function to get member details
export const getMemberDetails = (member: TeamMember) => {
  const memberName = getMemberName(member);
  const memberEmail = getMemberEmail(member);
  const memberPhone = getMemberPhone(member);
  const memberCompany = member.profile?.company || null;
  const avatarUrl = member.profile?.avatar_url || null;
  const initials = getInitials(memberName);
  const avatarColor = getDefaultAvatar(memberName);

  return {
    memberName,
    memberEmail,
    memberPhone,
    memberCompany,
    avatarUrl,
    initials,
    avatarColor
  };
};
