import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { ZoomIn, ZoomOut, Move, RotateCw, Upload, Edit, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Document, Annotation } from './types';
import { safeDisposeFabricCanvas, createSafeFabricCanvas } from './utils/fabricHelpers';

export interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  projectId?: string;
}

interface CanvasWithDragging extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
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
  const [canvasMode, setCanvasMode] = useState<'select' | 'pan' | 'annotate'>('select');
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
      selection: false,
    });

    // Gestionnaire d'événements
    canvas.on('mouse:down', (event) => {
      const canvasExt = canvas as CanvasWithDragging;

      if (canvasMode === 'pan') {
        const evt = event.e as MouseEvent;
        canvasExt.isDragging = true;
        canvasExt.lastPosX = evt.clientX;
        canvasExt.lastPosY = evt.clientY;
      } else if (canvasMode === 'annotate' && !event.target) {
        // Mode annotation
        const pointer = canvas.getPointer(event.e);
        onAddAnnotation({ x: pointer.x, y: pointer.y });
        toast.success('Annotation ajoutée');

        // Revenir au mode sélection après avoir ajouté une annotation
        setCanvasMode('select');
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

    setFabricCanvas(canvas);

    return () => {
      safeDisposeFabricCanvas(canvas);
    };
  }, [onAddAnnotation]);

  // Mettre à jour le curseur en fonction du mode
  useEffect(() => {
    if (fabricCanvas) {
      switch (canvasMode) {
        case 'pan':
          fabricCanvas.defaultCursor = 'move';
          break;
        case 'annotate':
          fabricCanvas.defaultCursor = 'crosshair';
          break;
        default:
          fabricCanvas.defaultCursor = 'default';
      }
    }
  }, [canvasMode, fabricCanvas]);

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

          // Calculer le facteur d'échelle pour adapter l'image au conteneur
          const scale = Math.min(
            container.clientWidth / imgElement.width,
            container.clientHeight / imgElement.height,
            1
          ) * 0.9;

          // Centrer l'image dans le conteneur
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
        // Déclencher un rechargement du document
        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.onload = () => {
          try {
            const fabricImage = new fabric.Image(imgElement);

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

            // Nettoyer le canvas
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

  // Changer le mode du canvas
  const handleSetMode = useCallback((mode: 'select' | 'pan' | 'annotate') => {
    setCanvasMode(mode);

    const modeMessages = {
      select: 'Mode sélection activé',
      pan: 'Mode déplacement activé',
      annotate: 'Mode annotation activé',
    };

    toast.info(modeMessages[mode]);
  }, []);

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
          toast.success(`Document ${file.name} chargé avec succès`);
        }
      };

      reader.readAsDataURL(file);

      // Réinitialiser l'input pour permettre de sélectionner le même fichier plusieurs fois
      e.target.value = '';
    },
    [onDocumentUpdate]
  );

  // Fonction pour télécharger l'image actuelle du canvas
  const handleDownload = useCallback(() => {
    if (!fabricCanvas || !document) return;

    try {
      // Générer une image du canvas actuel
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });

      // Créer un élément <a> pour télécharger
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${document.name || 'plan'}_with_annotations.png`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Image téléchargée');
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast.error('Erreur lors du téléchargement');
    }
  }, [fabricCanvas, document]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div
        ref={canvasContainerRef}
        className="flex-1 relative"
        style={{ cursor: getCursor(canvasMode) }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>

      {/* Barre d'outils principale - côté droit */}
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
          onClick={() => handleSetMode(canvasMode === 'pan' ? 'select' : 'pan')}
          title="Mode déplacement"
        >
          <Move className="h-5 w-5" />
        </Button>

        <Button
          variant={canvasMode === 'annotate' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => handleSetMode(canvasMode === 'annotate' ? 'select' : 'annotate')}
          title="Mode annotation"
        >
          <Edit className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleReset} title="Réinitialiser la vue">
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Boutons bas de page */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {/* Bouton d'upload */}
        <Button onClick={() => fileInputRef.current?.click()} className="shadow-lg">
          <Upload className="h-4 w-4 mr-2" />
          Télécharger un document
        </Button>

        {/* Bouton de téléchargement */}
        <Button
          variant="outline"
          onClick={handleDownload}
          className="shadow-lg"
          disabled={!document || document.url === '/placeholder.svg'}
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger l'image
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

// Fonction utilitaire pour définir le curseur en fonction du mode
function getCursor(mode: 'select' | 'pan' | 'annotate'): string {
  switch (mode) {
    case 'pan':
      return 'move';
    case 'annotate':
      return 'crosshair';
    default:
      return 'default';
  }
}
