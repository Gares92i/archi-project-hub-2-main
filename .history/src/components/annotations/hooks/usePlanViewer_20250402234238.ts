import { useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

interface UsePlanViewerReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  isPanning: boolean;
  isAddingAnnotation: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleTogglePanning: () => void;
  handleToggleAddAnnotation: () => void;
  handleReset: () => void;
  handleDownloadImage: () => void;
}

export const usePlanViewer = ({
  document,
  annotations,
  onAddAnnotation,
  onAnnotationClick,
  selectedAnnotation,
  canvasSize
}: UsePlanViewerProps): UsePlanViewerReturn => {
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
    addAnnotation
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

  // Function to download the image
  const handleDownloadImage = useCallback(() => {
    if (!canvas || !document) return;

    try {
      // Generate an image of the current canvas
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
      
      // Create an <a> element for download
      const link = window.document.createElement('a');
      link.href = dataURL;
      link.download = `${document.name || 'plan'}_with_annotations.png`;
      
      // Trigger the download
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast.success('Image downloaded');
    } catch (error) {
      console.error('Error downloading the image:', error);
      toast.error('Error during download');
    }
  // Initialize toast notifications
  useEffect(() => {
    toast.configure();
  }, []);

  return {
    canvasRef,
  return {
    canvasRef,
    canvasContainerRef: null, // Placeholder for canvasContainerRef
    isLoading,
    isPanning,
    isAddingAnnotation,
    handleZoomIn,
    handleZoomOut,
    handleTogglePanning,
    handleToggleAddAnnotation,
    handleReset: () => {}, // Placeholder for handleReset
    handleDownloadImage
  };
};
