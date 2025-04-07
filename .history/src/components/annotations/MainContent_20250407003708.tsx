import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  RotateCw,
  Upload,
  Maximize,
  MessageSquare, 
  MoveHorizontal,
  X,
} from "lucide-react";
import { Document, Annotation } from "./types";
import { FileUploader } from "./components/FileUploader";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeDocument,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLImageElement | HTMLIFrameElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  console.log("Annotations dans MainContent:", annotations.length);

  // Gestionnaires pour le zoom
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  // Gestionnaire pour la rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Gestionnaires pour le déplacement
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddingAnnotation) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({
      x: dragOffset.x + deltaX,
      y: dragOffset.y + deltaY,
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gestionnaire pour l'ajout d'annotation
  const handleClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation || !containerRef.current || !documentRef.current) return;

    const rect = documentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Les coordonnées sont relatives (0-1) pour s'adapter à n'importe quelle taille d'image
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      onAddAnnotation({ x, y });
      setIsAddingAnnotation(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fonction pour renderiser les annotations
  const renderAnnotations = () => {
    if (!annotations || annotations.length === 0 || !documentRef.current) return null;
    
    console.log("Renderisation des annotations:", annotations.length);
    const rect = documentRef.current.getBoundingClientRect();

    return annotations.map((annotation) => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      
      // Positions x et y en pourcentage (0-1)
      const x = (annotation.x || annotation.position?.x || 0);
      const y = (annotation.y || annotation.position?.y || 0);
      
      // Convertir en position absolue
      const posX = rect.left + (x * rect.width);
      const posY = rect.top + (y * rect.height);

      return (
        <div
          key={annotation.id}
          className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-colors border-2 ${
            isSelected
              ? "bg-primary border-primary-foreground w-6 h-6 z-30"
              : annotation.resolved || annotation.isResolved
              ? "bg-green-500 border-white w-5 h-5 z-20"
              : "bg-red-500 border-white w-5 h-5 z-20"
          }`}
          style={{
            left: `${posX}px`,
            top: `${posY}px`,
            zIndex: 100
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAnnotationClick(annotation);
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {isSelected ? "✓" : ""}
            </span>
          </div>
        </div>
      );
    });
  };

  // Effet pour mettre à jour la position des annotations quand on zoom/déplace/etc
  useEffect(() => {
    const updateAnnotationsPosition = () => {
      if (documentRef.current) {
        // Force re-render pour mettre à jour positions
        forceUpdate();
      }
    };
    
    const forceUpdate = () => {
      setZoomLevel(zoomLevel => zoomLevel);
    };

    window.addEventListener('resize', updateAnnotationsPosition);
    return () => {
      window.removeEventListener('resize', updateAnnotationsPosition);
    };
  }, []);

  // Référence du document actuel
  const setDocumentRef = (el: HTMLImageElement | HTMLIFrameElement | null) => {
    documentRef.current = el;
  };

  return (
    <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 h-full">
      {/* Toolbar avec les contrôles */}
      <div className="bg-card border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={isAddingAnnotation ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
            title="Ajouter une annotation"
          >
            {isAddingAnnotation ? (
              <>
                <X className="h-4 w-4 mr-1" /> Annuler
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-1" /> Annoter
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.1)}
            title="Zoom avant"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            title="Zoom arrière"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title="Rotation"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant={isDragging ? "default" : "outline"}
            size="sm"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            title="Déplacer"
          >
            <MoveHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            title="Importer un document"
          >
            <Upload className="h-4 w-4 mr-1" /> Importer
          </Button>
        </div>
      </div>

      {/* Zone principale du contenu */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={containerRef}
          className={`w-full h-full relative ${
            isAddingAnnotation ? "cursor-crosshair" : isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
        >
          {/* Document avec transformations */}
          <div 
            className="absolute left-1/2 top-1/2 transform-gpu"
            style={{
              transform: `translate(-50%, -50%) scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              marginLeft: dragOffset.x,
              marginTop: dragOffset.y,
            }}
          >
            {activeDocument && activeDocument.url && activeDocument.url !== '/placeholder.svg' ? (
              activeDocument.type === "pdf" ? (
                <iframe
                  ref={el => setDocumentRef(el)}
                  src={activeDocument.url}
                  title={activeDocument.name}
                  className="border-none bg-white"
                  style={{ width: '800px', height: '600px' }}
                />
              ) : (
                <img
                  ref={el => setDocumentRef(el)}
                  src={activeDocument.url}
                  alt={activeDocument.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ minWidth: '600px', minHeight: '400px' }}
                  onLoad={() => console.log("Image chargée")}
                />
              )
            ) : (
              <div className="bg-muted flex items-center justify-center p-8 rounded-lg min-w-[600px] min-h-[400px]">
                <p className="text-muted-foreground">
                  {activeDocument ? "Document sans contenu valide" : "Aucun document sélectionné"}
                </p>
              </div>
            )}
          </div>

          {/* Annotations superposées */}
          {renderAnnotations()}

          {/* Message d'aide pour l'ajout d'annotation */}
          {isAddingAnnotation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background border p-2 rounded-md shadow-md z-[200]">
              <p className="text-sm">
                Cliquez sur le plan pour ajouter une annotation
              </p>
            </div>
          )}

          {/* Message quand pas de document */}
          {!activeDocument && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="mb-4 text-muted-foreground">
                  Sélectionnez un document existant ou importez-en un nouveau
                </p>
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer un document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input file caché */}
      <FileUploader
        onDocumentUpdate={onDocumentUpdate}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};
