
import { Button } from "@/components/ui/button";

interface ChatSidebarHeaderProps {
  onNewConversation: () => void;
}

export function ChatSidebarHeader({ onNewConversation }: ChatSidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-xl font-semibold">Chats</h2>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <span className="sr-only">Plus d'options</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onNewConversation}>
          <span className="sr-only">Nouvelle conversation</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </Button>
      </div>
    </div>
  );
}
