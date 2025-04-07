
import { ChatConversation, ChatMessage } from '@/types/chat';

// Demo conversations for testing and development
export const getDemoConversations = (): ChatConversation[] => {
  return [
    {
      id: '1',
      name: 'Jane Doe',
      participants: [
        { 
          id: '1', 
          type: 'user', 
          name: 'Jane Doe', 
          avatarUrl: '/lovable-uploads/bb89e98a-4a16-4b0e-a295-ff17aaafd505.png' 
        }
      ],
      lastMessage: {
        content: 'Awesome! I am just chilling outside.',
        createdAt: '2023-06-21T12:39:00Z'
      },
      createdAt: '2023-06-21T10:00:00Z',
      updatedAt: '2023-06-21T12:39:00Z',
      isPrivate: true
    },
    {
      id: '2',
      name: 'John Doe',
      participants: [
        { 
          id: '2', 
          type: 'user', 
          name: 'John Doe', 
          avatarUrl: '' 
        }
      ],
      lastMessage: {
        content: 'Hello there!',
        createdAt: '2023-06-21T14:30:00Z'
      },
      createdAt: '2023-06-21T14:30:00Z',
      updatedAt: '2023-06-21T14:30:00Z',
      isPrivate: true
    }
  ];
};

// Get a specific demo conversation by ID
export const getDemoConversationById = (id: string): ChatConversation | null => {
  if (id === '1') {
    return {
      id: '1',
      name: 'Jane Doe',
      participants: [
        { 
          id: '1', 
          type: 'user', 
          name: 'Jane Doe', 
          avatarUrl: '/lovable-uploads/bb89e98a-4a16-4b0e-a295-ff17aaafd505.png' 
        }
      ],
      lastMessage: {
        content: 'Awesome! I am just chilling outside.',
        createdAt: '2023-06-21T12:39:00Z'
      },
      createdAt: '2023-06-21T10:00:00Z',
      updatedAt: '2023-06-21T12:39:00Z',
      isPrivate: true
    };
  } else if (id === '2') {
    return {
      id: '2',
      name: 'John Doe',
      participants: [
        { 
          id: '2', 
          type: 'user', 
          name: 'John Doe', 
          avatarUrl: '' 
        }
      ],
      lastMessage: {
        content: 'Hello there!',
        createdAt: '2023-06-21T14:30:00Z'
      },
      createdAt: '2023-06-21T14:30:00Z',
      updatedAt: '2023-06-21T14:30:00Z',
      isPrivate: true
    };
  }
  return null;
};

// Get demo messages for a conversation
export const getDemoMessagesForConversation = (conversationId: string): ChatMessage[] => {
  if (conversationId === '1') {
    return [
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
        senderId: 'current-user',
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
    ];
  } else if (conversationId === '2') {
    return [
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
    ];
  }
  return [];
};
