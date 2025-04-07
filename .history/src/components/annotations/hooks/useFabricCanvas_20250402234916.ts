import { useRef, useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';

interface UseFabricCanvasProps {
  width: number;
  height: number;
  onReady?: () => void;
}

export const useFabricCanvas = ({ width, height, onReady }: UseFabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Initialiser le canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Nettoyer le canvas précédent si existant
    if (canvas) {
      canvas.dispose();
    }

    // Créer le nouveau canvas
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      selection: false
    });

    setCanvas(newCanvas);
    setIsInitialized(true);

    if (onReady) {
      onReady();
    }

    // Nettoyage
    return () => {
      newCanvas.dispose();
      setIsInitialized(false);
    };
  }, [width, height]);

  // Fonction pour ajouter une image au canvas
  const addImage = useCallback((imageUrl: string, callback?: () => void) => {
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      // Nettoyer le canvas avant d'ajouter la nouvelle image
      canvas.clear();

      // Calculer l'échelle pour adapter l'image au canvas
      const scale = Math.min(
        canvas.width! / img.width!,
        canvas.height! / img.height!,
        1
      ) * 0.9;

      // Centrer l'image dans le canvas
      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: false,
        evented: false
      });

      // Ajouter l'image au canvas
      canvas.add(img);
      canvas.renderAll();

      if (callback) callback();
    });
  }, [canvas]);

  // Fonction pour zoomer
  const setZoom = useCallback((value: number) => {
    if (!canvas) return;
    
    canvas.setZoom(value);
    canvas.renderAll();
  }, [canvas]);

  // Fonction pour ajouter une annotation
  const addAnnotation = useCallback((annotation, options = {}) => {
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: annotation.x - 10,
      top: annotation.y - 10,
      radius: 10,
      fill: annotation.resolved ? 'green' : 'red',
      stroke: 'white',
      strokeWidth: 2,
      selectable: false,
      data: { type: 'annotation', id: annotation.id },
      ...options
    });

    canvas.add(circle);
    canvas.renderAll();

    return circle;
  }, [canvas]);

  // Fonctions pour le mode panoramique
  const startPanning = useCallback(() => {
    setIsPanning(true);
  }, []);

  const stopPanning = useCallback(() => {
    setIsPanning(false);
  }, []);

  const setLastPointer = useCallback((x: number, y: number) => {
    lastPointer.current = { x, y };
  }, []);

  return {
    canvasRef,
    canvas,
    isInitialized,
    addImage,
    setZoom,
    addAnnotation,
    startPanning,
    stopPanning,
    isPanning,
    lastPointer,
    setLastPointer
  };
};
