
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { markMessageAsRead } from '@/services/chat';
import { ChatMessage } from '@/types/chat';

export function useMessageSubscription(
  conversationId: string | undefined,
  currentUserId: string | null,
  onNewMessage: (message: ChatMessage) => void
) {
  useEffect(() => {
    if (!conversationId) return;

    // Set up realtime subscription
    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('Nouveau message reçu:', payload);
          // Get full message details
          try {
            const { data } = await supabase
              .from('chat_messages')
              .select(`
                *,
                profiles:sender_id(*)
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (data) {
              const newMessage: ChatMessage = {
                id: data.id,
                conversationId: data.conversation_id,
                senderId: data.sender_id,
                receiverId: data.receiver_id,
                content: data.content,
                read: data.read,
                createdAt: data.created_at,
                senderProfile: data.profiles as any
              };
              
              onNewMessage(newMessage);
              
              // Mark as read if not our message
              if (data.sender_id !== currentUserId) {
                markMessageAsRead(data.id);
              }
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, onNewMessage]);
}
