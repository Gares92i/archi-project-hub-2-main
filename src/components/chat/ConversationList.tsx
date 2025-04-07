
import { useEffect, useState } from 'react';
import { ChatConversation } from '@/types/chat';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserConversations } from '@/services/chat';
import { supabase } from '@/integrations/supabase/client';
import { ConversationItem } from './ConversationItem';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ChatConversation) => void;
  searchQuery: string;
}

export function ConversationList({ 
  selectedConversationId, 
  onSelectConversation,
  searchQuery
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const data = await getUserConversations();
        console.log('Loaded conversations:', data);
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    // Subscribe to realtime updates for conversations
    const channel = supabase
      .channel('chat-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_conversations'
        },
        async () => {
          // Reload conversations when a new one is created
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations'
        },
        async () => {
          // Reload conversations when one is updated
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // No need to add demo conversations here, as they are already included in getUserConversations

  const filteredConversations = conversations.filter(conv => 
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center p-3">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">
        {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
      </p>
    );
  }

  return (
    <>
      {filteredConversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => onSelectConversation(conversation)}
        />
      ))}
    </>
  );
}
