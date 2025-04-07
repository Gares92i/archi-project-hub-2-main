
import { Button } from "@/components/ui/button";
import { Phone, Video, Info } from "lucide-react";
import { ChatConversation } from "@/types/chat";

interface ChatHeaderProps {
  conversation: ChatConversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {conversation.participants[0]?.avatarUrl ? (
            <img 
              src={conversation.participants[0]?.avatarUrl} 
              alt={conversation.participants[0]?.name || "Avatar"} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {conversation.participants[0]?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{conversation.name || conversation.participants[0]?.name || "Conversation"}</h3>
          <p className="text-xs text-muted-foreground">Active 2 mins ago</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
