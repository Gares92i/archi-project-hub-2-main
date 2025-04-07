
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation } from '@/types/chat';
import { toast } from 'sonner';
import { getDemoConversations } from './demoDataService';

// Get conversations for the current user
export const getUserConversations = async (): Promise<ChatConversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');

    console.log('Fetching conversations for user:', user.id);
    
    // Get the demo conversations that we'll use as fallback
    const demoConversations = getDemoConversations();
    
    try {
      // Get real conversations - with simplified query to avoid recursion
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, name, created_at, updated_at, is_private, created_by')
        .order('updated_at', { ascending: false });
  
      if (error) {
        console.error('Fetch error:', error);
        // Just return demo conversations if there's an error
        return demoConversations;
      }
  
      if (data && data.length > 0) {
        // Process real conversations with simplified approach to avoid recursion
        const realConversations: ChatConversation[] = data.map(conv => ({
          id: conv.id,
          name: conv.name || `Conversation ${conv.id.substring(0, 4)}`,
          participants: [{ 
            id: conv.created_by, 
            type: 'user', 
            name: 'Utilisateur', 
            avatarUrl: '' 
          }],
          lastMessage: undefined,
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          isPrivate: conv.is_private || false
        }));
        
        // Combine demo and real conversations
        return [...demoConversations, ...realConversations];
      }
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      // Just return demo conversations if there's an error
    }
    
    // If all else fails, return the demo conversations
    return demoConversations;
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    toast.error('Erreur lors de la récupération des conversations');
    
    // Return demo conversations as fallback
    return getDemoConversations();
  }
};
