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

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });

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
    if (!fabricCanvasRef.current) {
      console.warn('Canvas non initialisé lors du chargement du document');
      return;
    }

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

  const handleZoomIn = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    
    fabricCanvasRef.current.setZoom(newZoom);
    fabricCanvasRef.current.renderAll();
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    
    fabricCanvasRef.current.setZoom(newZoom);
    fabricCanvasRef.current.renderAll();
  }, [zoom]);

  const handleReset = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    setZoom(1);
    setPan({ x: 0, y: 0 });
    
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvasRef.current.renderAll();
  }, []);

  const togglePanMode = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    setIsMoving(prev => {
      const newIsMoving = !prev;
      
      if (newIsMoving) {
        fabricCanvasRef.current!.defaultCursor = 'grab';
        fabricCanvasRef.current!.hoverCursor = 'grab';
        
        fabricCanvasRef.current!.on('mouse:down', handlePanStart);
        fabricCanvasRef.current!.on('mouse:move', handlePanMove);
        fabricCanvasRef.current!.on('mouse:up', handlePanEnd);
      } else {
        fabricCanvasRef.current!.defaultCursor = 'default';
        fabricCanvasRef.current!.hoverCursor = 'default';
        
        fabricCanvasRef.current!.off('mouse:down', handlePanStart);
        fabricCanvasRef.current!.off('mouse:move', handlePanMove);
        fabricCanvasRef.current!.off('mouse:up', handlePanEnd);
      }
      
      return newIsMoving;
    });
  }, []);

  const handlePanStart = useCallback((e: fabric.IEvent) => {
    if (!fabricCanvasRef.current || e.target) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.setCursor('grabbing');
    
    lastPanPosition.current = canvas.getPointer(e.e);
  }, []);

  const handlePanMove = useCallback((e: fabric.IEvent) => {
    if (!fabricCanvasRef.current || !isMoving) return;
    
    const canvas = fabricCanvasRef.current;
    const currentPointer = canvas.getPointer(e.e);
    
    const dx = currentPointer.x - lastPanPosition.current.x;
    const dy = currentPointer.y - lastPanPosition.current.y;
    
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    vpt[4] += dx;
    vpt[5] += dy;
    
    canvas.setViewportTransform(vpt);
    
    lastPanPosition.current = currentPointer;
    
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, [isMoving]);

  const handlePanEnd = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.setCursor('grab');
  }, []);

  const refreshCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    if (document?.url) {
      loadDocumentIntoCanvas(document.url);
    }
  }, [document, loadDocumentIntoCanvas]);

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
      
      <div className="absolute top-4 right-4 flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-md shadow-md">
        <button
          className={`p-1 rounded-md ${isMoving ? 'bg-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          onClick={togglePanMode}
          aria-label="Mode déplacement"
          title="Mode déplacement"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 4h-2v16h2V4z"/>
            <path d="M20 11h-9v2h9v-2z"/>
            <path d="M4 11h3v2H4v-2z"/>
          </svg>
        </button>
        <button
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={handleReset}
          aria-label="Réinitialiser"
          title="Réinitialiser"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={refreshCanvas}
          aria-label="Rafraîchir"
          title="Rafraîchir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h0.59L9 6"/>
            <path d="M13 6h6v6"/>
          </svg>
        </button>
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
