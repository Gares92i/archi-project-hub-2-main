
import { useEffect } from 'react';
import { Annotation, Document } from '../types';
import { useFabricCanvas } from './useFabricCanvas';
import { useZoom } from './useZoom';
import { useAnnotationMode } from './useAnnotationMode';
import { useDocumentLoader } from './useDocumentLoader';
import { usePanningMode } from './usePanningMode';
import { useCanvasEvents } from './useCanvasEvents';
import { useAnnotationsRenderer } from './useAnnotationsRenderer';

interface UsePlanViewerProps {
  document: Document;
  annotations: Annotation[];
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onAnnotationClick?: (annotation: Annotation) => void;
  selectedAnnotation?: Annotation | null;
  canvasSize: { width: number; height: number };
}

export const usePlanViewer = ({
  document,
  annotations,
  onAddAnnotation,
  onAnnotationClick,
  selectedAnnotation,
  canvasSize
}: UsePlanViewerProps) => {
  // Canvas hook
  const {
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
  } = useFabricCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onReady: () => {
      // Canvas ready, load the image if available
      if (document.url) {
        loadDocument(document.url);
      }
    }
  });

  // Document loading hook
  const { 
    isLoading, 
    loadDocument, 
    documentUrlRef
  } = useDocumentLoader({
    isInitialized,
    canvas,
    addImage,
    canvasSize
  });

  // Zoom hook
  const { handleZoomIn, handleZoomOut } = useZoom({ setZoom });

  // Annotation mode hook
  const { 
    isAddingAnnotation, 
    setIsAddingAnnotation, 
    handleToggleAddAnnotation 
  } = useAnnotationMode({ 
    stopPanning, 
    isPanning 
  });

  // Panning mode hook
  const { handleTogglePanning } = usePanningMode({
    isPanning,
    startPanning,
    stopPanning,
    setIsAddingAnnotation
  });

  // Canvas events hook
  useCanvasEvents({
    canvas,
    isAddingAnnotation,
    isPanning,
    onAddAnnotation,
    setIsAddingAnnotation,
    lastPointer,
    setLastPointer
  });

  // Annotations renderer hook
  const { setAnnotationObjects } = useAnnotationsRenderer({
    annotations,
    selectedAnnotation: selectedAnnotation || null,
    isInitialized,
    canvas,
    isAddingAnnotation,
    isPanning,
    onAnnotationClick,
    
  });

  // Load document when it changes
  useEffect(() => {
    if (document.url && isInitialized) {
      loadDocument(document.url);
    }
  }, [document.url, isInitialized, loadDocument]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setAnnotationObjects({});
      documentUrlRef.current = '';
    };
  }, [documentUrlRef, setAnnotationObjects]);

  return {
    canvasRef,
    isLoading,
    isPanning,
    lastPointer,
    isAddingAnnotation,
    handleZoomIn,
    handleZoomOut,
    handleTogglePanning,
    handleToggleAddAnnotation
  };
};
