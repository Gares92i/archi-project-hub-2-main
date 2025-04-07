
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatConversation } from "@/types/chat";
import { PrivateIndicator } from "./PrivateIndicator";

interface ConversationItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const displayName = conversation.name || 
    conversation.participants
      .filter(p => p.type !== 'user')
      .map(p => p.name)
      .join(', ');
  
  const fallbackName = displayName || "Conversation";
  
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div 
      className={`p-3 cursor-pointer hover:bg-secondary/30 ${isSelected ? 'bg-secondary/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage 
            src={conversation.participants[0]?.avatarUrl} 
            alt={fallbackName} 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(fallbackName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{fallbackName}</p>
              {conversation.isPrivate && <PrivateIndicator />}
            </div>
            {conversation.lastMessage && (
              <p className="text-xs text-muted-foreground truncate">
                {conversation.participants[0]?.name === "Jane Doe" ? "Jane: Typing..." : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
