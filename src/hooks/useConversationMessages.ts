
import { useState, useEffect } from 'react';
import { ChatMessage, ChatConversation } from '@/types/chat';
import { useDemoMessages } from './chat/useDemoMessages';
import { useRealMessages } from './chat/useRealMessages';

export function useConversationMessages(
  conversation: ChatConversation | null, 
  currentUserId: string | null
) {
  const [userId, setUserId] = useState<string | null>(currentUserId);
  
  // Update userId when currentUserId changes
  useEffect(() => {
    setUserId(currentUserId);
  }, [currentUserId]);

  // Hook for demo conversations
  const { 
    messages: demoMessages, 
    sendMessage: sendDemoMessage,
    isDemo
  } = useDemoMessages(conversation, userId);

  // Hook for real conversations
  const {
    messages: realMessages,
    isLoading,
    isSending,
    sendMessage: sendRealMessage
  } = useRealMessages(conversation, userId);

  // Choose the appropriate implementation based on conversation type
  const messages = isDemo ? demoMessages : realMessages;
  
  // Unified send message handler
  const handleSendMessage = async (text: string): Promise<void> => {
    if (isDemo) {
      sendDemoMessage(text);
      return Promise.resolve();
    } else {
      return sendRealMessage(text);
    }
  };

  return {
    messages,
    isLoading: !isDemo && isLoading,
    isSending: !isDemo && isSending,
    sendMessage: handleSendMessage
  };
}
