import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Annotation } from './types';
import { fabric } from 'fabric';
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
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [tempDocumentData, setTempDocumentData] = useState<{ url: string; filename: string } | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [fabricCanvasRef, setFabricCanvasRef] = useState<fabric.Canvas | null>(null);

  const saveFabricCanvas = useCallback((canvas: fabric.Canvas) => {
    setFabricCanvasRef(canvas);
    setIsCanvasReady(true);
  }, []);

  const addAnnotationsToCanvas = useCallback(() => {
    if (!fabricCanvasRef || !isCanvasReady) {
      console.log("Canvas not ready yet for annotations");
      return;
    }

    const canvas = fabricCanvasRef;

    canvas.getObjects().forEach(obj => {
      if (obj.data && obj.data.type === 'annotation') {
        canvas.remove(obj);
      }
    });

    annotations.forEach(annotation => {
      console.log("Adding annotation:", annotation.id);
    });

    if (selectedAnnotation) {
      console.log("Highlighting selected annotation:", selectedAnnotation.id);
    }

    canvas.renderAll();
  }, [annotations, selectedAnnotation, fabricCanvasRef, isCanvasReady]);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current || !canvasContainerRef.current) {
      console.error('Canvas references not set');
      return;
    }

    console.log('Initializing canvas for document:', document?.name);

    try {
      if (fabricCanvasRef) {
        try {
          console.log("Cleaning up previous canvas");
          fabricCanvasRef.dispose();
        } catch (error) {
          console.error("Error cleaning up canvas:", error);
        }
      }

      const canvas = new fabric.Canvas(canvasRef.current, {
        selection: false,
        preserveObjectStacking: true,
      });

      saveFabricCanvas(canvas);

      if (document?.url && document.url !== '/placeholder.svg') {
        console.log("Loading document into canvas:", document.url.substring(0, 30) + "...");
      }
    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  }, [document, saveFabricCanvas]);

  useEffect(() => {
    console.log("Document changed, initializing canvas");
    initCanvas();

    return () => {
      if (fabricCanvasRef) {
        try {
          console.log("Disposing canvas on unmount");
          fabricCanvasRef.dispose();
        } catch (error) {
          console.error("Error disposing canvas:", error);
        }
      }
    };
  }, [document, initCanvas]);

  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef) {
      console.log("Annotations changed, adding to canvas");
      addAnnotationsToCanvas();
    }
  }, [annotations, selectedAnnotation, isCanvasReady, addAnnotationsToCanvas, fabricCanvasRef]);

  const handleDocumentUpload = useCallback((url: string, filename: string) => {
    setTempDocumentData({ url, filename });
    setIsDocumentDialogOpen(true);
  }, []);

  const handleDocumentNameConfirm = useCallback((name: string) => {
    if (tempDocumentData) {
      console.log('Document name confirmed:', name);
      onDocumentUpdate(tempDocumentData.url, name);
      setTempDocumentData(null);
    }
  }, [onDocumentUpdate, tempDocumentData]);

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
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold truncate max-w-[50%]">{document.name}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            title="Télécharger un document"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <ButtonGroup>
            <Button
              variant="outline"
              title="Déplacer le document"
              size="sm"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              title="Zoomer"
              size="sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              title="Dézoomer"
              size="sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              title="Réinitialiser la vue"
              size="sm"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </ButtonGroup>
          <Button
            variant="outline"
            title="Ajouter une annotation"
            size="sm"
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Annoter
          </Button>
        </div>
      </div>

      <div
        className="flex-1 border rounded overflow-hidden bg-background relative"
        ref={canvasContainerRef}
      >
        <canvas ref={canvasRef} />
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
    </div>
  );
};
