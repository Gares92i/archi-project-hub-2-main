import { useEffect } from 'react';
import { fabric } from 'fabric';
import { toast } from 'sonner';

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  isAddingAnnotation: boolean;
  isPanning: boolean;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  setIsAddingAnnotation: (value: boolean) => void;
  lastPointer: React.MutableRefObject<{ x: number; y: number }>;
  setLastPointer: (x: number, y: number) => void;
}

export const useCanvasEvents = ({
  canvas,
  isAddingAnnotation,
  isPanning,
  onAddAnnotation,
  setIsAddingAnnotation,
  lastPointer,
  setLastPointer
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (event: fabric.IEvent) => {
      if (isAddingAnnotation && !event.target) {
        const pointer = canvas.getPointer(event.e);
        onAddAnnotation({ x: pointer.x, y: pointer.y });
        setIsAddingAnnotation(false);
        toast.success("Annotation ajoutée");
      } else if (isPanning) {
        canvas.setCursor('grabbing');
        const pointer = canvas.getPointer(event.e);
        setLastPointer(pointer.x, pointer.y);
      }
    };

    const handleMouseMove = (event: fabric.IEvent) => {
      if (!isPanning) return;

      canvas.setCursor('grabbing');
      const pointer = canvas.getPointer(event.e);
      const vpt = canvas.viewportTransform;

      if (vpt) {
        vpt[4] += pointer.x - lastPointer.current.x;
        vpt[5] += pointer.y - lastPointer.current.y;
        canvas.requestRenderAll();
        setLastPointer(pointer.x, pointer.y);
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        canvas.setCursor('grab');
      }
    };

    // Ajouter les gestionnaires d'événements
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    // Nettoyage
    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, isAddingAnnotation, isPanning, onAddAnnotation, setIsAddingAnnotation, lastPointer.current, setLastPointer]);

  // Mettre à jour le curseur en fonction du mode
  useEffect(() => {
    if (!canvas) return;

    if (isPanning) {
      canvas.setCursor('grab');
    } else if (isAddingAnnotation) {
      canvas.setCursor('crosshair');
    } else {
      canvas.setCursor('default');
    }
  }, [canvas, isPanning, isAddingAnnotation]);
};
