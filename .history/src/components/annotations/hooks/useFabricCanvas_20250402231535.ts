import { useRef, useState, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { Annotation } from '../types';
import {
  createSafeFabricCanvas,
  disposeFabricCanvas,
  calculateImageScale,
  centerImageInCanvas
} from '../utils/fabricHelpers';
import {
  clearCanvas,
  addImageToCanvas,
  setCanvasZoom,
  addAnnotationToCanvas,
  removeAllAnnotationsFromCanvas
} from '../utils/canvasOperations';

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
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ x: number, y: number } | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || width <= 0 || height <= 0) {
      return;
    }

    const setupCanvas = () => {
      try {
        // Clean up old canvas if it exists
        disposeFabricCanvas(canvas);
        setCanvas(null);
        
        // Create a new canvas with correct options
        const fabricCanvas = createSafeFabricCanvas(canvasRef.current!, { width, height });
        
        setCanvas(fabricCanvas);
        setIsInitialized(true);
        
        if (onReady) {
          onReady();
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du canvas:", error);
      }
    };

    setupCanvas();

    // Cleanup on unmount
    return () => {
      disposeFabricCanvas(canvas);
      setCanvas(null);
      setIsInitialized(false);
    };
  }, [width, height, onReady]);

  // Clear canvas handler
  const handleClearCanvas = useCallback(() => {
    clearCanvas(canvas);
  }, [canvas]);

  // Add image handler
  const handleAddImage = useCallback(async (url: string, canvasWidth: number, canvasHeight: number) => {
    return addImageToCanvas(
      canvas, 
      url, 
      calculateImageScale, 
      centerImageInCanvas, 
      canvasWidth, 
      canvasHeight
    );
  }, [canvas]);

  // Set zoom handler
  const handleSetZoom = useCallback((zoom: number) => {
    setCanvasZoom(canvas, zoom);
  }, [canvas]);

  // Add annotation handler
  const handleAddAnnotation = useCallback((annotation: Annotation, isSelected: boolean, onClick: () => void) => {
    return addAnnotationToCanvas(canvas, annotation, isSelected, onClick);
  }, [canvas]);

  // Remove all annotations handler
  const handleRemoveAllAnnotations = useCallback(() => {
    removeAllAnnotationsFromCanvas(canvas);
  }, [canvas]);

  // Panning mode handlers
  const startPanning = useCallback(() => {
    setIsPanning(true);
  }, []);

  const stopPanning = useCallback(() => {
    setIsPanning(false);
    setLastPointer(null);
  }, []);

  return {
    canvasRef,
    canvas,
    isInitialized,
    clearCanvas: handleClearCanvas,
    addImage: handleAddImage,
    setZoom: handleSetZoom,
    addAnnotation: handleAddAnnotation,
    removeAllAnnotations: handleRemoveAllAnnotations,
    startPanning,
    stopPanning,
    isPanning,
    lastPointer,
    setLastPointer
  };
};
