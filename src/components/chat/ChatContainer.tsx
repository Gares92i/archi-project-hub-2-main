
import { useEffect, useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatConversation } from '@/types/chat';
import { NewConversationDialog } from './NewConversationDialog';
import { ChatHeader } from './ChatHeader';
import { ChatSidebarHeader } from './ChatSidebarHeader';
import { EmptyConversation } from './EmptyConversation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function ChatContainer() {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Vous devez être connecté pour accéder au chat", {
        description: "Veuillez vous connecter pour continuer"
      });
    }
  }, [isAuthenticated, isLoading]);

  const handleNewConversation = () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour créer une conversation");
      return;
    }
    setIsNewConversationDialogOpen(true);
  };

  const handleConversationCreated = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsNewConversationDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="border rounded-md overflow-hidden shadow-sm bg-white h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="border rounded-md overflow-hidden shadow-sm bg-white h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-2xl font-semibold mb-4">Authentification requise</h3>
          <p className="text-muted-foreground">Veuillez vous connecter pour accéder au chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm bg-white">
      <div className="grid grid-cols-12 h-[calc(100vh-12rem)]">
        {/* Left sidebar */}
        <div className="col-span-4 md:col-span-3 border-r">
          <ChatSidebarHeader onNewConversation={handleNewConversation} />
          <ChatSidebar 
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
            onNewConversation={handleNewConversation}
          />
        </div>
        
        {/* Right content area */}
        <div className="col-span-8 md:col-span-9 flex flex-col">
          {selectedConversation ? (
            <>
              <ChatHeader conversation={selectedConversation} />
              <ChatMessages conversation={selectedConversation} />
            </>
          ) : (
            <EmptyConversation />
          )}
        </div>
      </div>

      <NewConversationDialog 
        open={isNewConversationDialogOpen} 
        onOpenChange={setIsNewConversationDialogOpen} 
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
