
import { useState, useEffect } from 'react';
import { ChatMessage, ChatConversation } from '@/types/chat';

export function useDemoMessages(conversation: ChatConversation | null, currentUserId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (conversation && ['1', '2'].includes(conversation.id)) {
      // For demonstration, use predefined messages for demo conversations
      if (conversation.id === '1') {
        setMessages([
          {
            id: '101',
            conversationId: '1',
            senderId: '1',
            content: 'How has your day been so far?',
            read: true,
            createdAt: '2023-06-21T10:06:00Z',
            senderProfile: { 
              id: '1', 
              first_name: 'Jane', 
              last_name: 'Doe',
              avatar_url: '/lovable-uploads/bb89e98a-4a16-4b0e-a295-ff17aaafd505.png' 
            } as any
          },
          {
            id: '102',
            conversationId: '1',
            senderId: currentUserId || 'current-user',
            content: 'It has been good. I went for a run this morning and then had a nice breakfast. How about you?',
            read: true,
            createdAt: '2023-06-21T10:10:00Z'
          },
          {
            id: '103',
            conversationId: '1',
            senderId: '1',
            content: 'Awesome! I am just chilling outside.',
            read: true,
            createdAt: '2023-06-21T12:39:00Z',
            senderProfile: { 
              id: '1', 
              first_name: 'Jane', 
              last_name: 'Doe',
              avatar_url: '/lovable-uploads/bb89e98a-4a16-4b0e-a295-ff17aaafd505.png' 
            } as any
          }
        ]);
      } else if (conversation.id === '2') {
        setMessages([
          {
            id: '201',
            conversationId: '2',
            senderId: '2',
            content: 'Hello there!',
            read: true,
            createdAt: '2023-06-21T14:30:00Z',
            senderProfile: { 
              id: '2', 
              first_name: 'John', 
              last_name: 'Doe',
              avatar_url: '' 
            } as any
          }
        ]);
      }
    }
  }, [conversation, currentUserId]);

  const handleSendDemoMessage = (text: string) => {
    if (!conversation || !text.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId || 'current-user',
      content: text,
      read: true,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return {
    messages,
    sendMessage: handleSendDemoMessage,
    isDemo: conversation && ['1', '2'].includes(conversation.id)
  };
}
