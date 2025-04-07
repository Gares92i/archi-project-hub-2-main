import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { getDemoMessagesForConversation } from './demoDataService';

// Récupérer les messages d'une conversation
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  try {
    // For demo conversations, return predefined messages
    if (conversationId === '1' || conversationId === '2') {
      return getDemoMessagesForConversation(conversationId);
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles:sender_id(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      read: msg.read,
      createdAt: msg.created_at,
      senderProfile: msg.profiles as unknown as UserProfile
    }));
  } catch (error) {
    console.error('Error retrieving messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
  }
};

// Envoyer un message
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  receiverId?: string
): Promise<ChatMessage | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utilisateur non authentifié');
    
    // Handle demo conversations
    if (conversationId === '1' || conversationId === '2') {
      const demoMsg: ChatMessage = {
        id: `demo-${Date.now()}`,
        conversationId,
        senderId: user.id,
        content,
        read: false,
        createdAt: new Date().toISOString()
      };
      return demoMsg;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Mettre à jour la date de dernière modification de la conversation
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: data.read,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    return null;
  }
};

// Marquer un message comme lu
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  // Skip for demo messages
  if (messageId.startsWith('demo-') || messageId.startsWith('101') || messageId.startsWith('102') || messageId.startsWith('103') || messageId.startsWith('201')) {
    return;
  }
  
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating read status:', error);
  }
};
