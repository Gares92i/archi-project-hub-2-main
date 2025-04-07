
import { useRef, useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { Annotation } from '../types';

interface UseFabricCanvasProps {
  width: number;
  height: number;
  onReady?: () => void;
}

interface UseFabricCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: fabric.Canvas | null;
  isInitialized: boolean;
  clearCanvas: () => void;
  addImage: (url: string, width: number, height: number) => Promise<void>;
  setZoom: (zoom: number) => void;
  addAnnotation: (annotation: Annotation, isSelected: boolean, onClick: () => void) => fabric.Object | null;
  removeAllAnnotations: () => void;
  startPanning: () => void;
  stopPanning: () => void;
  isPanning: boolean;
  lastPointer: { x: number, y: number } | null;
  setLastPointer: (point: { x: number, y: number } | null) => void;
}

export const useFabricCanvas = ({
  width,
  height,
  onReady
}: UseFabricCanvasProps): UseFabricCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
 const canvasRef = useRef<fabric.Canvas | null>(null);
const isInitializedRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ x: number, y: number } | null>(null);
  
  // Initialisation du canvas
  useEffect(() => {
    if (!canvasRef.current || width <= 0 || height <= 0 || isInitialized) {
      return;
    }

    // Nettoyage pour éviter les fuites mémoire et les boucles infinies
    const cleanup = () => {
      if (canvas) {
        try {
          // Suppression des écouteurs d'événements pour éviter les boucles
          canvas.off();
          canvas.dispose();
          setCanvas(null);
          setIsInitialized(false);
        } catch (error) {
          console.error("Erreur lors du nettoyage du canvas:", error);
        }
      }
    };

    try {
      cleanup(); // Nettoyer l'ancien canvas s'il existe
      
      // Créer un nouveau canvas avec des options correctes
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
        backgroundColor: '#f0f0f0',
        width,
        height,
        preserveObjectStacking: true
      });
      
      setCanvas(fabricCanvas);
      setIsInitialized(true);
      
      if (onReady) {
        onReady();
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du canvas:", error);
    }

    // Nettoyage lors du démontage
    return cleanup;
  }, [width, height, onReady]);

  // Gestionnaire de nettoyage du canvas
  const clearCanvas = useCallback(() => {
    if (!canvas) return;
    try {
      canvas.clear();
      canvas.backgroundColor = '#f0f0f0';
      canvas.renderAll();
    } catch (error) {
      console.error("Erreur lors du nettoyage du canvas:", error);
    }
  }, [canvas]);

  // Chargement d'une image dans le canvas
  const addImage = useCallback(async (url: string, canvasWidth: number, canvasHeight: number) => {
    if (!canvas) return;
    
    try {
      return new Promise<void>((resolve, reject) => {
        fabric.Image.fromURL(url, 
          (img) => {
            if (!img || !img.width || !img.height) {
              reject(new Error("Impossible de charger l'image"));
              return;
            }
            
            // Calculer l'échelle appropriée
            const scale = Math.min(
              (canvasWidth * 0.8) / img.width,
              (canvasHeight * 0.8) / img.height
            );
            
            img.set({
              selectable: false,
              evented: false,
              scaleX: scale,
              scaleY: scale,
              left: (canvasWidth - img.width * scale) / 2,
              top: (canvasHeight - img.height * scale) / 2
            });
            
            clearCanvas();
            canvas.add(img);
            canvas.renderAll();
            resolve();
          },
          { crossOrigin: 'Anonymous' }
        );
      });
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
    }
  }, [canvas, clearCanvas]);

  // Gestion du zoom
  const setZoom = useCallback((zoom: number) => {
    if (!canvas) return;
    
    try {
      canvas.setZoom(zoom);
      canvas.renderAll();
    } catch (error) {
      console.error("Erreur lors de la modification du zoom:", error);
    }
  }, [canvas]);

  // Ajout d'une annotation sur le canvas
  const addAnnotation = useCallback((annotation: Annotation, isSelected: boolean, onClick: () => void) => {
    if (!canvas) return null;
    
    try {
      const circle = new fabric.Circle({
        radius: 16,
        fill: isSelected ? '#ff4d4f' : '#ff8f1f',
        originX: 'center',
        originY: 'center',
        stroke: '#fff',
        strokeWidth: 2,
      });
      
      const text = new fabric.Text(annotation.id, {
        fontSize: 12,
        fill: 'white',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
      });
      
      const group = new fabric.Group([circle, text], {
        left: annotation.position.x,
        top: annotation.position.y,
        selectable: false,
        hoverCursor: 'pointer',
      });
      
      // Supprimer les écouteurs précédents pour éviter les doublons
      group.off('mousedown');
      group.on('mousedown', onClick);
      
      canvas.add(group);
      return group;
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une annotation:", error);
      return null;
    }
  }, [canvas]);

  // Suppression de toutes les annotations
  const removeAllAnnotations = useCallback(() => {
    if (!canvas) return;
    
    try {
      const objects = [...canvas.getObjects()];
      // Supprimer tous les objets sauf le premier (qui est l'image de fond)
      if (objects.length > 1) {
        for (let i = 1; i < objects.length; i++) {
          canvas.remove(objects[i]);
        }
      }
      canvas.renderAll();
    } catch (error) {
      console.error("Erreur lors de la suppression des annotations:", error);
    }
  }, [canvas]);

  // Activer le mode déplacement
  const startPanning = useCallback(() => {
    setIsPanning(true);
  }, []);

  // Désactiver le mode déplacement
  const stopPanning = useCallback(() => {
    setIsPanning(false);
    setLastPointer(null);
  }, []);

  return {
    canvasRef,
    canvas,
    isInitialized,
    clearCanvas,
    addImage,
    setZoom,
    addAnnotation,
    removeAllAnnotations,
    startPanning,
    stopPanning,
    isPanning,
    lastPointer,
    setLastPointer
  };
};
