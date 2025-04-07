import React from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddDocument?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddDocument }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-muted/30 rounded-full p-6 mb-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Aucun document sélectionné</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Sélectionnez un document existant dans le panneau latéral ou téléchargez un nouveau document pour commencer à ajouter des annotations.
      </p>
      {onAddDocument && (
        <Button onClick={onAddDocument}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un document
        </Button>
      )}
    </div>
  );
};