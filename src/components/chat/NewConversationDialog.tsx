
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChatConversation } from '@/types/chat';
import { createConversation } from '@/services/chat/conversationService';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: ChatConversation) => void;
}

export function NewConversationDialog({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}: NewConversationDialogProps) {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez donner un nom à la conversation');
      return;
    }

    setIsCreating(true);
    try {
      const conversationId = await createConversation(name, [], undefined, isPrivate);
      
      if (conversationId) {
        // Créer un objet ChatConversation temporaire
        const newConversation: ChatConversation = {
          id: conversationId,
          name,
          participants: [{ 
            id: '1', 
            type: 'user', 
            name: 'Jane Doe', 
            avatarUrl: '/lovable-uploads/bb89e98a-4a16-4b0e-a295-ff17aaafd505.png' 
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPrivate
        };
        
        onConversationCreated(newConversation);
        
        // Réinitialiser le formulaire
        setName('');
        setIsPrivate(true);
        toast.success('Conversation créée avec succès!');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Créez une nouvelle conversation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la conversation</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez un nom pour la conversation"
                disabled={isCreating}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPrivate" 
                checked={isPrivate} 
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                disabled={isCreating}
              />
              <Label htmlFor="isPrivate">Conversation privée</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Création...' : 'Créer la conversation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
