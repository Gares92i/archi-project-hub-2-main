import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Annotation } from './types';
import { fabric } from 'fabric';

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

  const cleanupCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    try {
      fabricCanvasRef.current.getObjects().forEach(obj => {
        fabricCanvasRef.current?.remove(obj);
      });

      fabricCanvasRef.current.off();

      try {
        const wrapperElement = (fabricCanvasRef.current as any).wrapperEl;
        const parentElement = wrapperElement?.parentNode;

        fabricCanvasRef.current.dispose();

        if (wrapperElement && parentElement && wrapperElement.parentNode === parentElement) {
          try {
            parentElement.removeChild(wrapperElement);
          } catch (e) {
            console.warn('Impossible de supprimer le wrapper manuellement:', e);
          }
        }
      } catch (error) {
        console.warn('Erreur lors de la disposition du canvas:', error);
      }

      fabricCanvasRef.current = null;
    } catch (error) {
      console.error('Erreur lors du nettoyage du canvas:', error);
    }
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

      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
        preserveObjectStacking: true,
        width: containerWidth,
        height: containerHeight,
      });

      fabricCanvasRef.current = canvas;

      canvas.on('mouse:down', (event) => {
        if (!event.target && canvas.getActiveObjects().length === 0) {
          const pointer = canvas.getPointer(event.e);
          onAddAnnotation({ x: pointer.x, y: pointer.y });
        }
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
      fabric.Image.fromURL(
        url,
        (img) => {
          canvas.clear();

          const scale = Math.min(
            containerWidth / img.width!,
            containerHeight / img.height!,
            1
          ) * 0.9;

          img.set({
            selectable: false,
            evented: false,
            scaleX: scale,
            scaleY: scale,
            left: (containerWidth - img.width! * scale) / 2,
            top: (containerHeight - img.height! * scale) / 2
          });

          canvas.add(img);
          img.sendToBack();
          canvas.renderAll();

          addAnnotationsToCanvas();
        },
        { crossOrigin: 'anonymous' }
      );
    }
  }, []);

  const addAnnotationsToCanvas = useCallback(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;

    const canvas = fabricCanvasRef.current;

    canvas.getObjects().forEach(obj => {
      if (obj.data && obj.data.type === 'annotation') {
        canvas.remove(obj);
      }
    });

    annotations.forEach(annotation => {
      const circle = new fabric.Circle({
        left: annotation.x - 10,
        top: annotation.y - 10,
        radius: 10,
        fill: annotation.resolved ? 'green' : 'red',
        stroke: 'white',
        strokeWidth: 2,
        selectable: false,
        data: { type: 'annotation', id: annotation.id }
      });

      circle.on('mousedown', () => {
        onAnnotationClick(annotation);
      });

      canvas.add(circle);
    });

    if (selectedAnnotation) {
      canvas.getObjects().forEach(obj => {
        if (obj.data && 
            obj.data.type === 'annotation' && 
            obj.data.id === selectedAnnotation.id) {
          obj.set({
            radius: 15,
            strokeWidth: 3,
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.5)',
              blur: 5,
              offsetX: 0,
              offsetY: 0
            })
          });
        }
      });
    }

    canvas.renderAll();
  }, [annotations, selectedAnnotation, isCanvasReady, onAnnotationClick]);

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
          height: container.clientHeight
        });

        if (document?.url) {
          loadDocumentIntoCanvas(document.url);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [document, loadDocumentIntoCanvas]);

  const handleDocumentSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDocumentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.type.includes('pdf')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }, [onDocumentUpdate]);

  return (
    <div className="relative flex flex-col w-full h-full">
      <div 
        ref={canvasContainerRef} 
        className="flex-1 relative overflow-hidden"
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>
      
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          className="bg-primary text-white p-2 rounded-full shadow-lg"
          onClick={handleDocumentSelect}
          aria-label="Télécharger un document"
          title="Télécharger un document"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
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
