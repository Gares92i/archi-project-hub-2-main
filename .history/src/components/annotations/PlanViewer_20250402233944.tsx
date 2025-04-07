import React from 'react';
import { ZoomIn, ZoomOut, Move, RotateCw, Upload, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Annotation, PlanViewerProps } from './types';
import { toast } from 'sonner';
import { usePlanViewer } from './hooks/usePlanViewer';
import { CanvasControls } from './components/CanvasControls';
import { CanvasContainer } from './components/CanvasContainer';
import { FileUploader } from './components/FileUploader';

export const PlanViewer: React.FC<PlanViewerProps> = ({
  document,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Utiliser le hook usePlanViewer qui gère déjà l'initialisation du canvas
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
    canvasSize: { width: 800, height: 600 } // Ces valeurs seront ajustées automatiquement
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
      <CanvasContainer
        ref={canvasContainerRef}
        isLoading={isLoading}
        isPanning={isPanning}
        isDragging={false}
      >
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 border border-red-500" 
          style={{zIndex: 10}}
        />

        {/* Afficher un état de chargement si nécessaire */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </CanvasContainer>
      
      {/* Contrôles du canvas */}
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isPanning={isPanning}
        onTogglePanning={handleTogglePanning}
        isAddingAnnotation={isAddingAnnotation}
        onToggleAddAnnotation={handleToggleAddAnnotation}
      />
      
      {/* Bouton de téléchargement en bas à gauche */}
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
