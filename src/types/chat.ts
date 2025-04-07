
import { UserProfile } from './auth';
import { Team } from './team';

export type ChatParticipantType = 'user' | 'client' | 'contractor' | 'team';

export interface ChatParticipant {
  id: string;
  type: ChatParticipantType;
  name: string;
  avatarUrl?: string;
}

export interface ChatConversation {
  id: string;
  name?: string;
  teamId?: string;
  projectId?: string;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderProfile?: UserProfile;
}
