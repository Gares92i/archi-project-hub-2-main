
import { UserRole, UserProfile } from './auth';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profiles?: UserProfile; // Optional profiles field
  profile?: UserProfile;  // More intuitive profile field
}

// Legacy team member interface to maintain backward compatibility
export interface LegacyTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  projects: string[];
  avatar?: string;
  status: "active" | "offline" | "busy";
}

// Supabase team member interface for handling database types
export interface SupabaseTeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  created_at: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}
