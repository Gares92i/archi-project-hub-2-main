import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Document, Annotation } from './types';
import { Button } from '@/components/ui/button';
import { Upload, MousePointer, ZoomIn, ZoomOut, Move, RotateCw } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ButtonGroup } from '@/components/ui/button-group';
import { DialogDocumentName } from './components/DialogDocumentName';
import { toast } from 'sonner';

interface PlanViewerProps {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [tempDocumentData, setTempDocumentData] = useState<{ url: string; filename: string } | null>(null);

  // Dans la fonction initCanvas, assurons-nous que l'URL du document est correctement vérifiée
  const initCanvas = useCallback(() => {
    if (!canvasRef.current || !canvasContainerRef.current) {
      console.error('Canvas references not set');
      return;
    }

    console.log('Initializing canvas for document:', document.name);
    console.log('Document URL:', document.url);

    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;

    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.dispose();
      } catch (e) {
        console.error('Error disposing canvas:', e);
      }
    }

    try {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth || 800,
        height: containerHeight || 600,
        backgroundColor: '#f5f5f5',
        selection: false,
      });

      fabricCanvasRef.current = canvas;

      // Vérification plus robuste de l'URL du document
      if (document.url && document.url !== '/placeholder.svg') {
        console.log('Loading document URL into canvas:', document.url.substring(0, 50) + '...');

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          console.log('Image loaded successfully');

          const fabricImage = new fabric.Image(img, {
            selectable: false,
            evented: false,
          });

          const scale = Math.min(
            (canvas.width || 800) / fabricImage.width!,
            (canvas.height || 600) / fabricImage.height!
          ) * 0.9;

          fabricImage.scale(scale);

          canvas.setBackgroundImage(
            fabricImage,
            canvas.renderAll.bind(canvas),
            {
              left: (canvas.width || 800) / 2 - (fabricImage.width! * scale) / 2,
              top: (canvas.height || 600) / 2 - (fabricImage.height! * scale) / 2,
            }
          );

          setIsCanvasReady(true);
          addAnnotationsToCanvas();
        };

        img.onerror = (err) => {
          console.error('Error loading image:', err);
          toast.error("Erreur lors du chargement de l'image");
          setIsCanvasReady(true);
        };

        img.src = document.url;
      } else {
        console.log('No valid document URL:', document.url);
        setIsCanvasReady(true);
      }
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      setIsCanvasReady(false);
    }
  }, [document, addAnnotationsToCanvas]);

  const addAnnotationsToCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const annotationObjects = canvas.getObjects().filter(obj => obj.data);
    annotationObjects.forEach(obj => canvas.remove(obj));

    annotations.forEach(annotation => {
      if (!annotation.position || typeof annotation.position.x !== 'number' || typeof annotation.position.y !== 'number') {
        console.error("Annotation avec position invalide:", annotation);
        return;
      }

      const circle = new fabric.Circle({
        left: 0,
        top: 0,
        radius: 10,
        fill: annotation.isResolved ? 'rgba(0, 200, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
        stroke: annotation.isResolved ? 'green' : 'red',
        strokeWidth: 2,
      });

      const label = new fabric.Text(String(annotation.id).slice(-1), {
        left: -5,
        top: -5,
        fontSize: 12,
        fill: 'white',
        fontWeight: 'bold',
        selectable: false,
        evented: false,
      });

      const group = new fabric.Group([circle, label], {
        left: annotation.position.x - 10,
        top: annotation.position.y - 10,
        selectable: false,
        data: annotation,
      });

      group.on('mousedown', () => {
        onAnnotationClick(annotation);
      });

      canvas.add(group);
    });

    if (selectedAnnotation) {
      highlightSelectedAnnotation();
    }

    canvas.renderAll();
  }, [annotations, selectedAnnotation, onAnnotationClick]);

  const highlightSelectedAnnotation = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedAnnotation) return;

    canvas.getObjects().forEach(obj => {
      if (obj.data && obj.data.id === selectedAnnotation.id) {
        obj.set({
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,255,0.5)',
            blur: 10,
            offsetX: 0,
            offsetY: 0,
          }),
        });

        const flashAnimation = () => {
          let opacity = 1;
          let increasing = false;

          const interval = setInterval(() => {
            if (opacity <= 0.5) increasing = true;
            if (opacity >= 1) increasing = false;

            opacity += increasing ? 0.05 : -0.05;
            obj.set({ opacity: opacity });
            canvas.renderAll();
          }, 50);

          setTimeout(() => {
            clearInterval(interval);
            obj.set({ opacity: 1 });
            canvas.renderAll();
          }, 1000);
        };

        flashAnimation();
      }
    });

    canvas.renderAll();
  }, [selectedAnnotation]);

  const handleCanvasClick = useCallback(
    (e: fabric.IEvent) => {
      if (!isAnnotationMode || !fabricCanvasRef.current || isMoveMode) return;

      const canvas = fabricCanvasRef.current;
      const pointer = canvas.getPointer(e.e);

      console.log("Ajout d'annotation à:", pointer);
      onAddAnnotation({
        x: pointer.x,
        y: pointer.y,
      });

      setIsAnnotationMode(false);
    },
    [isAnnotationMode, isMoveMode, onAddAnnotation]
  );

  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const zoomFactor = zoomIn ? 1.1 : 0.9;
      const newZoom = parseFloat((zoomLevel * zoomFactor).toFixed(2));

      if (newZoom < 0.5 || newZoom > 5) return;

      const center = {
        x: canvas.getWidth() / 2,
        y: canvas.getHeight() / 2,
      };

      canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
      setZoomLevel(newZoom);
    },
    [zoomLevel]
  );

  const handleResetView = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomLevel(1);
  }, []);

  const toggleMoveMode = useCallback(() => {
    setIsMoveMode(!isMoveMode);
    setIsAnnotationMode(false);
  }, [isMoveMode]);

  const toggleAnnotationMode = useCallback(() => {
    setIsAnnotationMode(!isAnnotationMode);
    setIsMoveMode(false);
  }, [isAnnotationMode]);

  const handleDocumentUpload = useCallback((url: string, filename: string) => {
    console.log('Document uploaded:', { url, filename });
    setTempDocumentData({ url, filename });
    setIsDocumentDialogOpen(true);
  }, []);

  // Dans la méthode handleDocumentNameConfirm, ajoutons des logs de débogage
  const handleDocumentNameConfirm = useCallback(
    (name: string) => {
      if (tempDocumentData) {
        console.log('Document name confirmed:', name);
        console.log('Document data:', tempDocumentData);

        onDocumentUpdate(tempDocumentData.url, name);
        setTempDocumentData(null);
        toast.success(`Document "${name}" ajouté avec succès`);
      }
    },
    [onDocumentUpdate]
  );

  useEffect(() => {
    console.log('Document changed in PlanViewer:', document.id, document.name);
    console.log('Document URL:', document.url);
    initCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.error('Error disposing canvas on unmount:', e);
        }
      }
    };
  }, [document, initCanvas]);

  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      addAnnotationsToCanvas();
    }
  }, [annotations, isCanvasReady, addAnnotationsToCanvas]);

  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      canvas.getObjects().forEach(obj => {
        if (obj.data) {
          obj.set({
            shadow: null,
            opacity: 1,
          });
        }
      });

      if (selectedAnnotation) {
        highlightSelectedAnnotation();
      }

      canvas.renderAll();
    }
  }, [selectedAnnotation, isCanvasReady, highlightSelectedAnnotation]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.off('mouse:down');
    canvas.off('mouse:move');

    canvas.on('mouse:down', handleCanvasClick);

    canvas.on('mouse:move', function (opt) {
      if (isMoveMode && opt.e.buttons === 1) {
        const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
        canvas.requestRenderAll();
      }
    });

    if (isAnnotationMode) {
      canvas.defaultCursor = 'crosshair';
    } else if (isMoveMode) {
      canvas.defaultCursor = 'grab';
    } else {
      canvas.defaultCursor = 'default';
    }
  }, [isAnnotationMode, isMoveMode, handleCanvasClick]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && fabricCanvasRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = canvasContainerRef.current.clientHeight;

        fabricCanvasRef.current.setWidth(containerWidth);
        fabricCanvasRef.current.setHeight(containerHeight);
        fabricCanvasRef.current.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Télécharger
        </Button>

        {/* Autres boutons */}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold truncate max-w-[50%]">{document.name}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleFileInputClick}
            title="Télécharger un document"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <ButtonGroup>
            <Button
              variant={isMoveMode ? "default" : "outline"}
              onClick={toggleMoveMode}
              title="Déplacer le document"
              size="sm"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(true)}
              title="Zoomer"
              size="sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(false)}
              title="Dézoomer"
              size="sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleResetView}
              title="Réinitialiser la vue"
              size="sm"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </ButtonGroup>
          <Button
            variant={isAnnotationMode ? "default" : "outline"}
            onClick={toggleAnnotationMode}
            title={isAnnotationMode ? "Annuler l'ajout d'annotation" : "Ajouter une annotation"}
            size="sm"
          >
            <MousePointer className="h-4 w-4 mr-2" />
            {isAnnotationMode ? "Annuler" : "Annoter"}
          </Button>
        </div>
      </div>

      <div
        className="flex-1 border rounded overflow-hidden bg-background relative"
        ref={canvasContainerRef}
      >
        <canvas ref={canvasRef} />

        <div className="absolute bottom-2 right-2 bg-background/80 rounded px-2 py-1 text-xs">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      <FileUploader
        onDocumentUpdate={handleDocumentUpload}
        fileInputRef={fileInputRef}
      />

      <DialogDocumentName
        isOpen={isDocumentDialogOpen}
        onClose={() => setIsDocumentDialogOpen(false)}
        onSave={handleDocumentNameConfirm}
        defaultName={tempDocumentData?.filename || "Nouveau document"}
      />

      {isAnnotationMode && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            Cliquez sur le plan pour ajouter une annotation
          </div>
        </div>
      )}

      {isMoveMode && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            Mode déplacement : cliquez et faites glisser pour déplacer le plan
          </div>
        </div>
      )}
    </div>
  );
};
