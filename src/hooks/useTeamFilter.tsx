
import { useState, useMemo } from "react";
import { TeamMember } from "@/types/team";
import { getMemberName, getMemberEmail } from "@/components/team/utils/memberUtils";

export const useTeamFilter = (members: TeamMember[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Use useMemo to compute filtered members without setting state inside
  const filteredMembers = useMemo(() => {
    // Skip filtering if members array is empty
    if (!members || members.length === 0) {
      return [];
    }

    let filtered = [...members];

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter((member) => {
        // Utiliser les fonctions utilitaires pour accéder au nom et email
        const memberName = getMemberName(member).toLowerCase();
        const memberEmail = getMemberEmail(member).toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        return memberName.includes(searchLower) || 
               memberEmail.includes(searchLower) ||
               (member.role || '').toLowerCase().includes(searchLower);
      });
    }

    // Filtrer par rôle (onglet)
    if (activeTab !== "all") {
      const roleMap: Record<string, string[]> = {
        "architects": ["architect"],
        "engineers": ["engineer"],
        "designers": ["designer"]
      };

      const targetRoles = roleMap[activeTab] || [];
      
      if (targetRoles.length > 0) {
        filtered = filtered.filter(member => 
          targetRoles.includes(member.role?.toLowerCase() || '')
        );
      }
    }

    return filtered;
  }, [members, searchQuery, activeTab]);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredMembers
  };
};
