import React from 'react';
import { ZoomIn, ZoomOut, Move, RotateCw, Upload, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Annotation } from './types';
import { toast } from 'sonner';
import { usePlanViewer } from './hooks/usePlanViewer';

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
  onAnnotationClick
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Utiliser le hook usePlanViewer
  const {
    canvasRef,
    canvasContainerRef,
    isLoading,
    isPanning,
    isAddingAnnotation,
    handleZoomIn,
    handleZoomOut,
    handleTogglePanning,
    handleToggleAddAnnotation,
    handleReset,
    handleDownloadImage
  } = usePlanViewer({
    document,
    annotations,
    onAddAnnotation,
    onAnnotationClick,
    selectedAnnotation,
    canvasSize: { width: 800, height: 600 } // Valeurs par défaut, seront ajustées
  });

  // Gestionnaire pour le téléchargement de document
  const handleDocumentUpload = React.useCallback(
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
      e.target.value = ''; // Réinitialiser l'input
    },
    [onDocumentUpdate]
  );

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Conteneur du canvas */}
      <div
        ref={canvasContainerRef}
        className="flex-1 relative"
        style={{ 
          cursor: isPanning ? 'grab' : isAddingAnnotation ? 'crosshair' : 'default' 
        }}
      >
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 border border-gray-200" 
        />

        {/* Afficher un état de chargement si nécessaire */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Barre d'outils - côté droit */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom avant"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom arrière"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isPanning ? "secondary" : "ghost"}
          size="icon"
          onClick={handleTogglePanning}
          title="Mode déplacement"
        >
          <Move className="h-5 w-5" />
        </Button>
        
        <Button
          variant={isAddingAnnotation ? "secondary" : "ghost"}
          size="icon"
          onClick={handleToggleAddAnnotation}
          title="Mode annotation"
        >
          <Edit className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Réinitialiser la vue"
        >
          <RotateCw className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Boutons bas de page */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="shadow-lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          Télécharger un document
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownloadImage}
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
