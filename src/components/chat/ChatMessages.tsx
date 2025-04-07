
import { useEffect, useState } from 'react';
import { ChatConversation } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { EmptyConversation } from './EmptyConversation';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useConversationMessages } from '@/hooks/useConversationMessages';

interface ChatMessagesProps {
  conversation: ChatConversation | null;
}

export function ChatMessages({ conversation }: ChatMessagesProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    
    fetchCurrentUser();
  }, []);

  const { messages, isLoading, isSending, sendMessage } = useConversationMessages(
    conversation,
    currentUserId
  );

  if (!conversation) {
    return <EmptyConversation />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          isLoading={isLoading}
        />
      </div>

      <MessageInput 
        onSendMessage={sendMessage}
        isSending={isSending}
      />
    </div>
  );
}
