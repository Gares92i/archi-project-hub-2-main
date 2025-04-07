import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { ZoomIn, ZoomOut, Move, RotateCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Document, Annotation } from './types';
import { createSafeFabricCanvas, safeDisposeFabricCanvas } from './utils/fabricHelpers';

export interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  projectId?: string;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({
  document,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
  projectId,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan'>('select');
  const [scale, setScale] = useState(1);

  const cleanupCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    safeDisposeFabricCanvas(fabricCanvasRef.current);
    fabricCanvasRef.current = null;
  }, []);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current || !canvasContainerRef.current) {
      console.error('Références canvas non définies');
      return;
    }

    cleanupCanvas();

    try {
      const container = canvasContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      canvasRef.current.width = containerWidth;
      canvasRef.current.height = containerHeight;

      const canvas = createSafeFabricCanvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
        selection: false,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      canvas.on('mouse:down', (event) => {
        if (canvasMode === 'pan') {
          canvas.set({
            viewportTransform: canvas.viewportTransform,
            lastPosX: event.e.clientX,
            lastPosY: event.e.clientY,
            isDragging: true,
          } as any);
        } else if (!event.target && canvas.getActiveObjects().length === 0) {
          const pointer = canvas.getPointer(event.e);
          onAddAnnotation({ x: pointer.x, y: pointer.y });
        }
      });

      canvas.on('mouse:move', (event) => {
        if (canvasMode === 'pan' && (canvas as any).isDragging) {
          const vpt = canvas.viewportTransform!;
          vpt[4] += event.e.clientX - (canvas as any).lastPosX;
          vpt[5] += event.e.clientY - (canvas as any).lastPosY;

          (canvas as any).lastPosX = event.e.clientX;
          (canvas as any).lastPosY = event.e.clientY;

          canvas.requestRenderAll();
        }
      });

      canvas.on('mouse:up', () => {
        (canvas as any).isDragging = false;
        canvas.setViewportTransform(canvas.viewportTransform!);
      });

      if (document?.url && document.url !== '/placeholder.svg') {
        loadDocumentIntoCanvas(document.url);
      }

      setIsCanvasReady(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du canvas:', error);
    }
  }, [cleanupCanvas, document, onAddAnnotation]);

  const loadDocumentIntoCanvas = useCallback((url: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const containerWidth = canvasContainerRef.current?.clientWidth || 800;
    const containerHeight = canvasContainerRef.current?.clientHeight || 600;

    if (url.startsWith('data:application/pdf') || url.endsWith('.pdf')) {
      console.log('Chargement de PDF non implémenté');
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        canvas.clear();

        const fbImg = new fabric.Image(img, {
          selectable: false,
          evented: false,
        });

        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height,
          1
        ) * 0.9;

        fbImg.scale(scale);
        fbImg.set({
          left: (containerWidth - img.width * scale) / 2,
          top: (containerHeight - img.height * scale) / 2,
        });

        canvas.add(fbImg);
        fbImg.sendToBack();

        canvas.renderAll();

        addAnnotationsToCanvas();
      };

      img.onerror = () => {
        console.error('Erreur lors du chargement de l\'image:', url);
        toast.error('Erreur lors du chargement du document');
      };

      img.src = url;
    }
  }, []);

  const addAnnotationsToCanvas = useCallback(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;

    const canvas = fabricCanvasRef.current;

    canvas.getObjects().forEach((obj) => {
      if (obj.data && obj.data.type === 'annotation') {
        canvas.remove(obj);
      }
    });

    annotations.forEach((annotation) => {
      const circle = new fabric.Circle({
        left: annotation.x - 10,
        top: annotation.y - 10,
        radius: 10,
        fill: annotation.resolved ? 'green' : 'red',
        stroke: 'white',
        strokeWidth: 2,
        selectable: false,
        data: { type: 'annotation', id: annotation.id },
      });

      circle.on('mousedown', () => {
        onAnnotationClick(annotation);
      });

      canvas.add(circle);
    });

    if (selectedAnnotation) {
      canvas.getObjects().forEach((obj) => {
        if (
          obj.data &&
          obj.data.type === 'annotation' &&
          obj.data.id === selectedAnnotation.id
        ) {
          obj.set({
            radius: 15,
            strokeWidth: 3,
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.5)',
              blur: 5,
              offsetX: 0,
              offsetY: 0,
            }),
          });
        }
      });
    }

    canvas.renderAll();
  }, [annotations, selectedAnnotation, isCanvasReady, onAnnotationClick]);

  const handleZoomIn = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const newZoom = Math.min(scale * 1.25, 5);

    const center = {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2,
    };

    canvas.zoomToPoint({ x: center.x, y: center.y }, newZoom);
    setScale(newZoom);

    canvas.renderAll();
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const newZoom = Math.max(scale * 0.8, 0.1);

    const center = {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2,
    };

    canvas.zoomToPoint({ x: center.x, y: center.y }, newZoom);
    setScale(newZoom);

    canvas.renderAll();
  }, [scale]);

  const togglePanMode = useCallback(() => {
    setCanvasMode((prev) => (prev === 'pan' ? 'select' : 'pan'));

    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      if (canvasMode === 'select') {
        canvas.defaultCursor = 'move';
        toast.info('Mode déplacement activé');
      } else {
        canvas.defaultCursor = 'default';
        toast.info('Mode sélection activé');
      }
    }
  }, [canvasMode]);

  const handleRefresh = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setScale(1);

    if (document?.url) {
      loadDocumentIntoCanvas(document.url);
    }

    toast.success('Vue réinitialisée');
  }, [document, loadDocumentIntoCanvas]);

  const handleSave = useCallback(() => {
    if (!document) return;

    const documentData = {
      ...document,
      annotations,
    };

    localStorage.setItem(`document_${document.id}`, JSON.stringify(documentData));
    toast.success('Document sauvegardé');
  }, [document, annotations]);

  const handleDocumentSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDocumentUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onDocumentUpdate(result, file.name);
        }
      };

      reader.readAsDataURL(file);

      event.target.value = '';
    },
    [onDocumentUpdate]
  );

  useEffect(() => {
    console.log('Document changé, initialisation du canvas');
    initCanvas();

    return () => {
      console.log('Démontage du composant, nettoyage du canvas');
      cleanupCanvas();
    };
  }, [document, initCanvas, cleanupCanvas]);

  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      console.log('Mise à jour des annotations sur le canvas');
      addAnnotationsToCanvas();
    }
  }, [annotations, selectedAnnotation, isCanvasReady, addAnnotationsToCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && fabricCanvasRef.current) {
        const container = canvasContainerRef.current;
        fabricCanvasRef.current.setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });

        if (document?.url) {
          loadDocumentIntoCanvas(document.url);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [document, loadDocumentIntoCanvas]);

  useEffect(() => {
    if (document && document.id) {
      const savedData = localStorage.getItem(`document_${document.id}`);
      if (savedData) {
        try {
          toast.info('Un état sauvegardé est disponible pour ce document');
        } catch (error) {
          console.error('Erreur lors du chargement des données sauvegardées:', error);
        }
      }
    }
  }, [document]);

  return (
    <div className="relative flex flex-col w-full h-full">
      <div
        ref={canvasContainerRef}
        className="flex-1 relative overflow-hidden"
        style={{ cursor: canvasMode === 'pan' ? 'move' : 'default' }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom avant">
          <ZoomIn className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom arrière">
          <ZoomOut className="h-5 w-5" />
        </Button>

        <Button
          variant={canvasMode === 'pan' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={togglePanMode}
          title="Mode déplacement"
        >
          <Move className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Réinitialiser la vue">
          <RotateCw className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleSave} title="Sauvegarder l'état">
          <Save className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4">
        <Button
          variant="default"
          onClick={handleDocumentSelect}
          className="rounded-full shadow-lg"
          title="Télécharger un document"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Télécharger un document
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*, application/pdf"
        style={{ display: 'none' }}
        onChange={handleDocumentUpload}
      />
    </div>
  );
};
