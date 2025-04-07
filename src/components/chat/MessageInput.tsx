
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Smile, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

export function MessageInput({ onSendMessage, isSending }: MessageInputProps) {
  const [newMessageText, setNewMessageText] = useState('');

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || isSending) return;
    
    await onSendMessage(newMessageText);
    setNewMessageText('');
  };

  return (
    <div className="p-3 bg-white border-t flex items-center">
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input
        value={newMessageText}
        onChange={(e) => setNewMessageText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="Type a message..."
        className="flex-1 mx-2 border-none shadow-none focus-visible:ring-0"
        disabled={isSending}
      />
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Smile className="h-5 w-5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground"
        onClick={handleSendMessage}
        disabled={!newMessageText.trim() || isSending}
      >
        <ThumbsUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
