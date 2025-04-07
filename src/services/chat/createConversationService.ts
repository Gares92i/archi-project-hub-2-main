
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Create a new conversation
export const createConversation = async (
  name: string, 
  participants: string[], 
  teamId?: string,
  isPrivate: boolean = false
): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');

    // Create conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        name,
        created_by: user.id,
        is_private: isPrivate,
        ...(teamId && !isPrivate ? { team_id: teamId } : {}),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Insertion error:', error);
      throw error;
    }
    
    // Return the conversation ID
    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Erreur lors de la création de la conversation');
    return null;
  }
};
