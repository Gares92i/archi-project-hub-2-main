
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Hand, Flag } from 'lucide-react';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  isPanning: boolean;
  onTogglePanning: () => void;
  isAddingAnnotation: boolean;
  onToggleAddAnnotation: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  isPanning,
  onTogglePanning,
  isAddingAnnotation,
  onToggleAddAnnotation
}) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
      <Button 
        size="icon" 
        onClick={onZoomIn} 
        variant="secondary"
        title="Zoom avant"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        onClick={onZoomOut} 
        variant="secondary"
        title="Zoom arrière"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant={isPanning ? "destructive" : "secondary"}
        onClick={onTogglePanning}
        title="Mode déplacement"
      >
        <Hand className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant={isAddingAnnotation ? "destructive" : "secondary"}
        onClick={onToggleAddAnnotation}
        title="Ajouter une annotation"
      >
        <Flag className="h-4 w-4" />
      </Button>
    </div>
  );
};
