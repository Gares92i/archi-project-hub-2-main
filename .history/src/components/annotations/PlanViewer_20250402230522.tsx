import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { ZoomIn, ZoomOut, Move, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Document, Annotation } from './types';
// Corriger les noms des fonctions importées
import { safeDisposeFabricCanvas, createSafeFabricCanvas } from './utils/fabricHelpers';

// Ajouter cette interface
interface CanvasWithDragging extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
}

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
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan'>('select');
  const [zoom, setZoom] = useState(1);

  // Initialiser le canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    // Nettoyer le canvas précédent si existant
    if (fabricCanvas) {
      safeDisposeFabricCanvas(fabricCanvas);
    }

    const container = canvasContainerRef.current;
    const canvas = createSafeFabricCanvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
    });

    setFabricCanvas(canvas);

    // Ajouter les gestionnaires d'événements pour le mode pan et annotation
    canvas.on('mouse:down', (event) => {
      if (canvasMode === 'pan') {
        const evt = event.e as MouseEvent;
        const canvasExt = canvas as CanvasWithDragging;
        canvasExt.isDragging = true;
        canvasExt.lastPosX = evt.clientX;
        canvasExt.lastPosY = evt.clientY;
      } else if (!event.target) {
        // Mode annotation
        const pointer = canvas.getPointer(event.e);
        onAddAnnotation({ x: pointer.x, y: pointer.y });
      }
    });

    canvas.on('mouse:move', (event) => {
      const canvasExt = canvas as CanvasWithDragging;
      if (canvasMode === 'pan' && canvasExt.isDragging) {
        const evt = event.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (!vpt) return;

        vpt[4] += evt.clientX - (canvasExt.lastPosX || 0);
        vpt[5] += evt.clientY - (canvasExt.lastPosY || 0);

        canvasExt.lastPosX = evt.clientX;
        canvasExt.lastPosY = evt.clientY;

        canvas.requestRenderAll();
      }
    });

    canvas.on('mouse:up', () => {
      const canvasExt = canvas as CanvasWithDragging;
      canvasExt.isDragging = false;
    });

    return () => {
      safeDisposeFabricCanvas(canvas);
    };
  }, [canvasMode, onAddAnnotation]);

  // Mettre à jour les annotations quand elles changent
  const renderAnnotations = useCallback(() => {
    if (!fabricCanvas) return;

    // Supprimer les annotations existantes
    fabricCanvas.getObjects().forEach((obj) => {
      if (obj.data && obj.data.type === 'annotation') {
        fabricCanvas.remove(obj);
      }
    });

    // Ajouter les nouvelles annotations
    annotations.forEach((annotation) => {
      const circle = new fabric.Circle({
        radius: 10,
        fill: annotation.resolved ? 'green' : 'red',
        stroke: 'white',
        strokeWidth: 2,
        left: annotation.x - 10,
        top: annotation.y - 10,
        selectable: false,
        data: { type: 'annotation', id: annotation.id },
      });

      // Ajouter un gestionnaire d'événement pour les clics
      circle.on('mousedown', () => onAnnotationClick(annotation));

      // Si c'est l'annotation sélectionnée, la mettre en évidence
      if (selectedAnnotation && selectedAnnotation.id === annotation.id) {
        circle.set({
          radius: 12,
          strokeWidth: 3,
          stroke: 'yellow',
        });
      }

      fabricCanvas.add(circle);
    });

    fabricCanvas.renderAll();
  }, [annotations, fabricCanvas, onAnnotationClick, selectedAnnotation]);

  // Charger le document lorsqu'il change
  useEffect(() => {
    if (!fabricCanvas || !document?.url || document.url === '/placeholder.svg') return;

    // Charger l'image
    const loadImage = () => {
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';

      imgElement.onload = () => {
        try {
          // Vérifier que le canvas est toujours valide
          if (!fabricCanvas || !canvasContainerRef.current) return;

          // Créer l'objet image Fabric
          const fabricImage = new fabric.Image(imgElement);

          const container = canvasContainerRef.current;

          // Si les fonctions utilitaires ne sont pas disponibles, on les implémente ici
          const scale = Math.min(
            container.clientWidth / imgElement.width,
            container.clientHeight / imgElement.height,
            1
          ) * 0.9;

          fabricImage.scale(scale);
          fabricImage.set({
            left: (container.clientWidth - imgElement.width * scale) / 2,
            top: (container.clientHeight - imgElement.height * scale) / 2,
            selectable: false,
            evented: false,
          });

          // Nettoyer le canvas avant d'ajouter la nouvelle image
          // Ne supprime que les éléments qui ne sont pas des annotations
          fabricCanvas.getObjects().forEach((obj) => {
            if (!obj.data || obj.data.type !== 'annotation') {
              fabricCanvas.remove(obj);
            }
          });

          // Ajouter l'image au canvas
          fabricCanvas.add(fabricImage);
          fabricImage.sendToBack();

          // Render après avoir ajouté l'image
          fabricCanvas.renderAll();

          // Ajouter les annotations
          renderAnnotations();
        } catch (error) {
          console.error('Erreur lors du chargement de l\'image dans le canvas:', error);
          toast.error('Erreur lors du chargement de l\'image');
        }
      };

      imgElement.onerror = () => {
        console.error('Erreur lors du chargement de l\'image:', document.url);
        toast.error('Impossible de charger l\'image');
      };

      imgElement.src = document.url;
    };

    loadImage();
  }, [document?.url, fabricCanvas, renderAnnotations]);

  // Mettre à jour les annotations lorsqu'elles changent
  useEffect(() => {
    renderAnnotations();
  }, [annotations, selectedAnnotation, renderAnnotations]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (!fabricCanvas || !canvasContainerRef.current) return;

      const container = canvasContainerRef.current;
      fabricCanvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      // Recharger le document si nécessaire
      if (document?.url && document.url !== '/placeholder.svg') {
        // Déclencher un rechargement du document après redimensionnement
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.onload = () => {
          try {
            const fabricImage = new fabric.Image(imgElement);

            // Utiliser ces fonctions qui sont bien définies dans fabricHelpers.ts
            const scale = Math.min(
              container.clientWidth / imgElement.width,
              container.clientHeight / imgElement.height,
              1
            ) * 0.9;

            fabricImage.scale(scale);
            fabricImage.set({
              left: (container.clientWidth - imgElement.width * scale) / 2,
              top: (container.clientHeight - imgElement.height * scale) / 2,
              selectable: false,
              evented: false,
            });

            // Nettoyer le canvas avant d'ajouter la nouvelle image
            fabricCanvas.getObjects().forEach((obj) => {
              if (!obj.data || obj.data.type !== 'annotation') {
                fabricCanvas.remove(obj);
              }
            });

            fabricCanvas.add(fabricImage);
            fabricImage.sendToBack();
            fabricCanvas.renderAll();

            // Re-render les annotations
            renderAnnotations();
          } catch (error) {
            console.error('Erreur lors du rechargement après redimensionnement:', error);
          }
        };

        imgElement.src = document.url;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [document?.url, fabricCanvas, renderAnnotations]);

  // Gestionnaires pour les fonctions de zoom
  const handleZoomIn = useCallback(() => {
    if (!fabricCanvas) return;

    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);

    const center = {
      x: fabricCanvas.getWidth() / 2,
      y: fabricCanvas.getHeight() / 2,
    };

    fabricCanvas.zoomToPoint(center, newZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas, zoom]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvas) return;

    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);

    const center = {
      x: fabricCanvas.getWidth() / 2,
      y: fabricCanvas.getHeight() / 2,
    };

    fabricCanvas.zoomToPoint(center, newZoom);
    fabricCanvas.renderAll();
  }, [fabricCanvas, zoom]);

  const handleTogglePanMode = useCallback(() => {
    setCanvasMode((prev) => (prev === 'select' ? 'pan' : 'select'));

    if (fabricCanvas) {
      fabricCanvas.defaultCursor = canvasMode === 'select' ? 'move' : 'default';
    }

    toast.info(`Mode ${canvasMode === 'select' ? 'déplacement' : 'annotation'} activé`);
  }, [canvasMode, fabricCanvas]);

  const handleReset = useCallback(() => {
    if (!fabricCanvas) return;

    // Réinitialiser le zoom et la position
    setZoom(1);
    fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvas.renderAll();

    toast.success('Vue réinitialisée');
  }, [fabricCanvas]);

  // Gestionnaire pour le téléchargement de document
  const handleDocumentUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onDocumentUpdate(result, file.name);
        }
      };

      reader.readAsDataURL(file);

      // Réinitialiser l'input pour permettre de sélectionner le même fichier plusieurs fois
      e.target.value = '';
    },
    [onDocumentUpdate]
  );

  return (
    <div className="w-full h-full flex flex-col relative">
      <div
        ref={canvasContainerRef}
        className="flex-1 relative"
        style={{ cursor: canvasMode === 'pan' ? 'move' : 'default' }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>

      {/* Barre d'outils */}
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
          onClick={handleTogglePanMode}
          title="Mode déplacement"
        >
          <Move className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleReset} title="Réinitialiser la vue">
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Bouton d'upload */}
      <div className="absolute bottom-4 left-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Télécharger un document
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleDocumentUpload}
        accept="image/*,application/pdf"
      />
    </div>
  );
};
