
import { useState, useEffect, useCallback } from 'react';
import { getConversationMessages, markMessageAsRead, sendMessage } from '@/services/chat';
import { ChatMessage, ChatConversation } from '@/types/chat';
import { useMessageSubscription } from './useMessageSubscription';
import { toast } from 'sonner';

export function useRealMessages(conversation: ChatConversation | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Callback for adding new messages from subscription
  const handleNewMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Set up real-time subscription
  useMessageSubscription(
    conversation?.id,
    currentUserId,
    handleNewMessage
  );

  // Load initial messages
  useEffect(() => {
    if (!conversation) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const data = await getConversationMessages(conversation.id);
        setMessages(data);
        
        // Mark messages as read
        if (currentUserId) {
          data.forEach(msg => {
            if (!msg.read && msg.senderId !== currentUserId) {
              markMessageAsRead(msg.id);
            }
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversation, currentUserId]);

  // Send message handler
  const handleSendMessage = async (text: string) => {
    if (!conversation || !text.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const message = await sendMessage(
        conversation.id, 
        text,
        conversation.isPrivate ? conversation.participants.find(p => p.id !== currentUserId)?.id : undefined
      );
      
      if (!message) {
        toast.error("Impossible d'envoyer le message");
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage: handleSendMessage
  };
}
