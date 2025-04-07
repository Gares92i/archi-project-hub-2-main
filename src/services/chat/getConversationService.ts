
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation } from '@/types/chat';
import { toast } from 'sonner';
import { getDemoConversationById } from './demoDataService';

// Get a single conversation by ID
export const getConversationById = async (id: string): Promise<ChatConversation | null> => {
  try {
    // Check if this is a demo conversation
    const demoConversation = getDemoConversationById(id);
    if (demoConversation) {
      return demoConversation;
    }
  
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');
    
    // Simplified query to avoid recursion
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, name, created_at, updated_at, is_private, created_by')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch error:', error);
      throw error;
    }
    
    // Create conversation with minimal data to avoid recursion
    return {
      id: data.id,
      name: data.name || `Conversation ${data.id.substring(0, 4)}`,
      participants: [{ 
        id: data.created_by, 
        type: 'user', 
        name: 'Utilisateur', 
        avatarUrl: '' 
      }],
      lastMessage: undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPrivate: data.is_private || false
    };
  } catch (error) {
    console.error('Error retrieving conversation:', error);
    toast.error('Erreur lors de la récupération de la conversation');
    return null;
  }
};
