import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  RotateCw,
  Upload,
  Maximize,
  Annotation,
  MoveHorizontal,
  X,
} from "lucide-react";
import { Document, Annotation as AnnotationType } from "./types";
import { FileUploader } from "./components/FileUploader";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: AnnotationType[];
  selectedAnnotation: AnnotationType | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
  onAnnotationClick: (annotation: AnnotationType) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

  // Gestion du zoom
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  };

  // Gestion de la rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Gestion du mode plein écran
  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error("Erreur : Impossible de passer en mode plein écran");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Détecter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Gestion du déplacement (pan)
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

  // Gestion des clics pour ajouter des annotations
  const handleClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation || !containerRef.current) return;

    // Calculer la position relative au conteneur
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - dragOffset.y) / zoomLevel;

    onAddAnnotation({ x, y });
    setIsAddingAnnotation(false);
  };

  // Trigger du file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Réinitialiser la vue
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setDragOffset({ x: 0, y: 0 });
  };

  // Pour le rendu des annotations
  const renderAnnotations = () => {
    if (!annotations || annotations.length === 0) return null;
    
    return annotations.map((ann) => {
      const isSelected = selectedAnnotation?.id === ann.id;
      const posX = (ann.x || ann.position?.x || 0) * zoomLevel + dragOffset.x;
      const posY = (ann.y || ann.position?.y || 0) * zoomLevel + dragOffset.y;
      
      return (
        <div
          key={ann.id}
          className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all border-2 ${
            isSelected
              ? "bg-primary border-primary-foreground w-6 h-6 z-30"
              : ann.resolved || ann.isResolved
              ? "bg-green-500 border-white w-5 h-5 z-20"
              : "bg-red-500 border-white w-5 h-5 z-20"
          }`}
          style={{
            left: posX,
            top: posY,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAnnotationClick(ann);
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

  // Fonction pour charger le document
  const loadDocument = useCallback(() => {
    if (!activeDocument || !containerRef.current) return;
    
    setIsDocumentLoading(true);
    
    // Nettoyer le conteneur avant de charger le nouveau document
    const existingImg = containerRef.current.querySelector('img:not(.annotation-image)');
    if (existingImg) {
      existingImg.remove();
    }
    
    const existingPdf = containerRef.current.querySelector('iframe, div[data-pdf]');
    if (existingPdf) {
      existingPdf.remove();
    }
    
    if (activeDocument.type === "pdf") {
      // Créer un iframe pour le PDF
      const iframe = document.createElement('iframe');
      iframe.src = activeDocument.url;
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.zIndex = '0';
      iframe.setAttribute('data-pdf', 'true');
      
      iframe.onload = () => {
        setIsDocumentLoading(false);
      };
      
      iframe.onerror = () => {
        setIsDocumentLoading(false);
        toast.error("Impossible de charger le PDF");
      };
      
      containerRef.current.appendChild(iframe);
    } else if (activeDocument.type === "img") {
      // Créer une image
      const img = new Image();
      img.src = activeDocument.url;
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'contain';
      img.style.zIndex = '0';
      
      img.onload = () => {
        setIsDocumentLoading(false);
      };
      
      img.onerror = () => {
        setIsDocumentLoading(false);
        toast.error("Impossible de charger l'image");
      };
      
      containerRef.current.appendChild(img);
    } else {
      setIsDocumentLoading(false);
    }
  }, [activeDocument]);

  // Charger le document quand il change
  useEffect(() => {
    loadDocument();
    handleReset();
  }, [activeDocument?.id, loadDocument]);

  return (
    <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 h-full">
      {/* Barre d'outils */}
      <div className="bg-card border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={isAddingAnnotation ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
          >
            {isAddingAnnotation ? (
              <>
                <X className="h-4 w-4 mr-1" /> Annuler
              </>
            ) : (
              <>
                <Annotation className="h-4 w-4 mr-1" /> Annoter
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant={isDragging ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDragging(!isDragging)}
          >
            <MoveHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-1" /> Importer
          </Button>
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteneur principal */}
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
          style={{ overflow: 'hidden' }}
        >
          {/* Le document sera chargé ici */}
          
          {/* Afficher un indicateur de chargement */}
          {isDocumentLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* Message si pas de document */}
          {!activeDocument && !isDocumentLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Aucun document sélectionné ou importé.
              </p>
              <Button onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Importer un document
              </Button>
            </div>
          )}

          {/* Afficher les annotations */}
          {renderAnnotations()}

          {/* Message pendant le mode annotation */}
          {isAddingAnnotation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background border p-2 rounded-md shadow-md z-50">
              <p className="text-sm">
                Cliquez sur le plan pour ajouter une annotation
              </p>
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
