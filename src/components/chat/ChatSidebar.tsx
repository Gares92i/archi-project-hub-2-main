
import { useState } from 'react';
import { ChatConversation } from '@/types/chat';
import { SearchInput } from './SearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationList } from './ConversationList';

interface ChatSidebarProps {
  onSelectConversation: (conversation: ChatConversation) => void;
  selectedConversationId?: string;
  onNewConversation: () => void;
}

export function ChatSidebar({ 
  onSelectConversation, 
  selectedConversationId,
  onNewConversation 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex flex-col">
      <div className="p-3">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      <ScrollArea className="flex-1">
        <div>
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
            searchQuery={searchQuery}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
