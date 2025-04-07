import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/team';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

// Add a team member
export const addTeamMember = async (teamId: string, userId: string, role: UserRole): Promise<TeamMember> => {
  try {
    if (!teamId || !userId || !role) {
      throw new Error("Team ID, User ID, and role are required to add a team member");
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    // If user doesn't exist and we're using an email
    if (!userExists && userId.includes('@')) {
      // Create a temporary user profile with the email
      const tempId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: tempId,
          email: userId,
          first_name: 'Utilisateur',
          last_name: 'Temporaire'
        });
      
      if (profileError) {
        console.error('Error creating temporary profile:', profileError);
        throw profileError;
      }
      
      userId = tempId;
    }
    
    // We need to use "as any" here to bypass TypeScript's strict type checking
    // since the Supabase generated types may not perfectly match our extended UserRole type
    const { data, error } = await supabase
      .from('team_members')
      .insert({ 
        team_id: teamId, 
        user_id: userId, 
        role: role as any,
        name: `User ${userId.slice(0, 5)}`, // Default name
        email: userId.includes('@') ? userId : `user-${userId.slice(0, 5)}@example.com` // Default email
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding team member:', error);
      if (error.code === '23505') {
        toast.error("Ce membre fait déjà partie de l'équipe");
      } else {
        toast.error("Impossible d'ajouter le membre à l'équipe");
      }
      throw error;
    }

    return data as TeamMember;
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    // Toast is already shown in the error handling above
    throw new Error("Failed to add team member");
  }
};

// Update a team member
export const updateTeamMember = async (teamId: string, userId: string, role: UserRole): Promise<TeamMember> => {
  try {
    if (!teamId || !userId || !role) {
      throw new Error("Team ID, User ID, and role are required to update a team member");
    }
    
    // Using "as any" to bypass type checking for the role field
    const { data, error } = await supabase
      .from('team_members')
      .update({ role: role as any })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      toast.error("Impossible de mettre à jour le membre de l'équipe");
      throw error;
    }

    toast.success("Membre de l'équipe mis à jour avec succès");
    return data as TeamMember;
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    // Toast is already shown in the error handling above
    throw new Error("Failed to update team member");
  }
};

// Get all team members
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    if (!teamId) {
      throw new Error("Team ID is required to get team members");
    }
    
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id(*)
      `)
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }

    // Transform the data structure to match expected format
    return data.map(item => ({
      ...item,
      profile: item.profiles
    })) as unknown as TeamMember[];
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    toast.error("Impossible de récupérer les membres de l'équipe");
    return [];
  }
};

// Remove a team member
export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  try {
    if (!teamId || !userId) {
      throw new Error("Team ID and User ID are required to remove a team member");
    }
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing team member:', error);
      toast.error("Impossible de supprimer le membre de l'équipe");
      throw error;
    }

    toast.success("Membre supprimé de l'équipe avec succès");
  } catch (error) {
    console.error('Error in removeTeamMember:', error);
    // Toast is already shown in the error handling above
    throw new Error("Failed to remove team member");
  }
};

// Check if a user is a member of a team
export const isTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  try {
    if (!teamId || !userId) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking team membership:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isTeamMember:', error);
    return false;
  }
};
