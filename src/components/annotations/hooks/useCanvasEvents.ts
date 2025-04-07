
import { useCallback, useEffect } from 'react';
import { fabric } from 'fabric';

interface UseCanvasEventsProps {
  canvas: fabric.Canvas | null;
  isAddingAnnotation: boolean;
  isPanning: boolean;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  setIsAddingAnnotation: (value: boolean) => void;
  lastPointer: { x: number, y: number } | null;
  setLastPointer: (pointer: { x: number, y: number } | null) => void;
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
  const handleMouseDown = useCallback((event: fabric.IEvent) => {
    if (!canvas || !event.pointer) return;
    
    if (isAddingAnnotation) {
      const pointer = canvas.getPointer(event.e);
      onAddAnnotation({ x: pointer.x, y: pointer.y });
      setIsAddingAnnotation(false);
    }

    if (isPanning) {
      setLastPointer({
        x: event.pointer.x,
        y: event.pointer.y
      });
    }
  }, [canvas, isAddingAnnotation, isPanning, onAddAnnotation, setIsAddingAnnotation, setLastPointer]);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseMove = (event: fabric.IEvent) => {
      if (!isPanning || !lastPointer || !event.pointer || !canvas.viewportTransform) return;
      
      canvas.viewportTransform[4] += event.pointer.x - lastPointer.x;
      canvas.viewportTransform[5] += event.pointer.y - lastPointer.y;
      
      canvas.requestRenderAll();
      setLastPointer({
        x: event.pointer.x,
        y: event.pointer.y
      });
    };

    const handleMouseUp = () => {
      setLastPointer(null);
    };

    // Clean up previous listeners
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    
    // Add new listeners
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      if (canvas) {
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('mouse:move', handleMouseMove);
        canvas.off('mouse:up', handleMouseUp);
      }
    };
  }, [canvas, handleMouseDown, isPanning, lastPointer, setLastPointer]);

  return {
    handleMouseDown
  };
};
