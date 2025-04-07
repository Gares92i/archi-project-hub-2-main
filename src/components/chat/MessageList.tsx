
import { ChatMessage } from "@/types/chat";
import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string | null;
  isLoading: boolean;
  bubbleVariant?: "default" | "primary" | "secondary" | "ghost";
  showAvatars?: boolean;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  isLoading, 
  bubbleVariant = "default",
  showAvatars = true
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <p className="text-muted-foreground">Chargement des messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">Aucun message. Commencez la conversation!</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <MessageBubble 
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
          variant={bubbleVariant}
          showAvatar={showAvatars}
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
