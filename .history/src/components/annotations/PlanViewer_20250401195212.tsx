import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { Annotation, Document } from './types';
import { toast } from 'sonner';
import { useFabricCanvas } from './hooks/useFabricCanvas';
import { DocumentHeader } from './components/DocumentHeader';
import { CanvasControls } from './components/CanvasControls';
import { CanvasContainer } from './components/CanvasContainer';

interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate?: (url: string) => void;
  onAnnotationClick?: (annotation: Annotation) => void;
  selectedAnnotation?: Annotation | null;
  projectId?: string;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ 
  document, 
  annotations, 
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
  selectedAnnotation,
  projectId
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentUrlRef = useRef<string>('');
  
  // États locaux
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoomValue] = useState(1);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [annotationObjects, setAnnotationObjects] = useState<Record<string, fabric.Object>>({});
  
  // Hook personnalisé pour gérer le canvas
  const {
    canvasRef,
    canvas,
    isInitialized,
    addImage,
    setZoom,
    addAnnotation,
    removeAllAnnotations,
    startPanning,
    stopPanning,
    isPanning,
    lastPointer,
    setLastPointer
  } = useFabricCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onReady: () => {
      // Canvas prêt, charger l'image si disponible
      if (document.url) {
        loadDocument(document.url);
      }
    }
  });

  // Mise à jour de la taille du canvas en fonction du conteneur
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = window.innerHeight * 0.7;
        setCanvasSize({
          width: containerWidth - 40,
          height: containerHeight
        });
      }
    };

    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Chargement du document
  const loadDocument = useCallback(async (url: string) => {
    if (!isInitialized || !canvas) return;
    
    // Éviter de recharger le même document
    if (documentUrlRef.current === url) return;
    documentUrlRef.current = url;
    
    setIsLoading(true);
    
    try {
      await addImage(url, canvasSize.width, canvasSize.height);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
      setIsLoading(false);
      toast.error("Erreur lors du chargement du document");
    }
  }, [isInitialized, canvas, addImage, canvasSize]);

  // Charger le document lorsqu'il change
  useEffect(() => {
    if (document.url && isInitialized) {
      loadDocument(document.url);
    }
  }, [document.url, isInitialized, loadDocument]);

  // Appliquer le zoom
  useEffect(() => {
    if (isInitialized) {
      setZoom(zoom);
    }
  }, [zoom, isInitialized, setZoom]);

  // Créer une fonction qui limite les appels pour éviter les boucles infinies
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
  }, [canvas, isAddingAnnotation, isPanning, onAddAnnotation, setLastPointer]);

  // Gestionnaire des événements souris du canvas
  useEffect(() => {
    if (!canvas) return;

    // Créer des gestionnaires spécifiques pour éviter les re-renders
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

    // Nettoyer les écouteurs précédents
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    
    // Ajouter les nouveaux écouteurs
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
  }, [canvas, handleMouseDown, isPanning, lastPointer]);

  // Mettre à jour les annotations sur le canvas - avec une dépendance plus fine
  useEffect(() => {
    if (!isInitialized || !canvas || !annotations.length) return;
    
    // Créer une référence aux annotations actuelles pour comparer
    const annotationIds = annotations.map(a => a.id).join(',');
    const selectedId = selectedAnnotation?.id || '';
    
    // Nettoyer les anciennes annotations
    const oldAnnotationObjects = { ...annotationObjects };
    Object.values(oldAnnotationObjects).forEach(obj => {
      if (canvas.contains(obj)) {
        canvas.remove(obj);
      }
    });
    
    // Créer de nouvelles annotations
    const newAnnotationObjects: Record<string, fabric.Object> = {};
    
    annotations.forEach(annotation => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      const onClick = () => {
        if (!isAddingAnnotation && !isPanning && onAnnotationClick) {
          onAnnotationClick(annotation);
        }
      };
      
      const annotationObject = addAnnotation(annotation, isSelected, onClick);
      if (annotationObject) {
        newAnnotationObjects[annotation.id] = annotationObject;
      }
    });
    
    setAnnotationObjects(newAnnotationObjects);
    
    // S'assurer que les nouvelles annotations sont rendues
    canvas.requestRenderAll();
    
  }, [annotations, selectedAnnotation, isInitialized, canvas, isAddingAnnotation, isPanning, onAnnotationClick, addAnnotation]);

  // Gestionnaire de téléchargement de fichiers
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (onDocumentUpdate) {
        onDocumentUpdate(dataUrl);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success("Document téléchargé avec succès");
    };
    
    reader.readAsDataURL(file);
  }, [onDocumentUpdate]);

  // Gestionnaires d'actions
  const handleZoomIn = useCallback(() => {
    setZoomValue(z => Math.min(z + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomValue(z => Math.max(z - 0.1, 0.2));
  }, []);

  const handleTogglePanning = useCallback(() => {
    if (isPanning) {
      stopPanning();
    } else {
      startPanning();
      setIsAddingAnnotation(false);
    }
  }, [isPanning, startPanning, stopPanning]);

  const handleToggleAddAnnotation = useCallback(() => {
    setIsAddingAnnotation(a => !a);
    if (isPanning) {
      stopPanning();
    }
  }, [isPanning, stopPanning]);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les états et libérer la mémoire
      setAnnotationObjects({});
      documentUrlRef.current = '';
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col">
      <DocumentHeader
        documentName={document.name}
        onUploadClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileChange={handleFileUpload}
      />
      
      <CanvasContainer
        isLoading={isLoading}
        isPanning={isPanning}
        isDragging={isPanning && lastPointer !== null}
      >
        <canvas 
          ref={canvasRef}
          className="max-w-full h-auto"
        />
      </CanvasContainer>
      
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isPanning={isPanning}
        onTogglePanning={handleTogglePanning}
        isAddingAnnotation={isAddingAnnotation}
        onToggleAddAnnotation={handleToggleAddAnnotation}
      />
    </div>
  );
};
