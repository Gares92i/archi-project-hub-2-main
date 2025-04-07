
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types/chat";
import { format } from "date-fns";
import { ChatBubble, ChatBubbleFooter } from "@/components/ui/chat-bubble";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  variant?: "default" | "primary" | "secondary" | "ghost";
  showAvatar?: boolean;
  timestampFormat?: string;
  className?: string;
}

export function MessageBubble({ 
  message, 
  isCurrentUser, 
  variant = "default",
  showAvatar = true,
  timestampFormat = "HH:mm a",
  className
}: MessageBubbleProps) {
  const messageDate = new Date(message.createdAt);
  const timeString = format(messageDate, timestampFormat);
  
  const senderName = message.senderProfile ? 
    `${message.senderProfile.first_name || ''} ${message.senderProfile.last_name || ''}`.trim() : 
    'Utilisateur';
  
  const avatarSrc = message.senderProfile?.avatar_url || undefined;
  
  // Map variant to appropriate styles
  const getVariantStyles = () => {
    switch(variant) {
      case "primary":
        return isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground";
      case "secondary":
        return isCurrentUser ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground";
      case "ghost":
        return isCurrentUser ? "border border-primary/30 bg-primary/10 text-foreground" : "border bg-background text-foreground";
      default:
        return isCurrentUser ? "bg-black text-white" : "bg-white border";
    }
  };

  return (
    <div className={cn(
      "mb-4 flex", 
      isCurrentUser ? "justify-end" : "justify-start",
      className
    )}>
      {!isCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 mr-2 mt-1">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <ChatBubble 
        className={cn(
          "max-w-xs sm:max-w-md p-3",
          getVariantStyles()
        )}
        position={isCurrentUser ? "end" : "start"}
        align={isCurrentUser ? "end" : "start"}
      >
        <div className="break-words">{message.content}</div>
        <ChatBubbleFooter className={cn(
          "text-xs mt-1",
          isCurrentUser ? "text-inherit/70" : "text-muted-foreground"
        )}>
          {timeString}
        </ChatBubbleFooter>
      </ChatBubble>
      
      {isCurrentUser && showAvatar && (
        <Avatar className="h-8 w-8 ml-2 mt-1">
          <AvatarImage src={avatarSrc || "https://github.com/shadcn.png"} />
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
