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
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAddingAnnotation) return;
      
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isAddingAnnotation]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setDragOffset({
        x: dragOffset.x + deltaX,
        y: dragOffset.y + deltaY,
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Gestion des clics pour ajouter des annotations
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isAddingAnnotation || !containerRef.current) return;

      // Calculer la position relative au conteneur
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragOffset.x) / zoomLevel;
      const y = (e.clientY - rect.top - dragOffset.y) / zoomLevel;

      onAddAnnotation({ x, y });
      setIsAddingAnnotation(false);
    },
    [isAddingAnnotation, dragOffset, zoomLevel, onAddAnnotation]
  );

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
              : ann.resolved
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

  // Effet pour charger le document actif
  useEffect(() => {
    if (activeDocument && containerRef.current) {
      setIsDocumentLoading(true);
      
      if (activeDocument.type === "pdf") {
        renderPdfDocument(activeDocument.url);
      } else if (activeDocument.type === "img") {
        renderImageDocument(activeDocument.url);
      }
      
      // Réinitialiser la vue quand un nouveau document est chargé
      handleReset();
    }
  }, [activeDocument?.id]);
  
  // Fonction pour le rendu d'images
  const renderImageDocument = (url: string) => {
    if (!containerRef.current) return;
    
    // Nettoyer le contenu précédent
    const existingImg = containerRef.current.querySelector('img:not(.annotation-image)');
    if (existingImg) {
      existingImg.remove();
    }
  
    // Créer une nouvelle image
    const img = new Image();
    img.onload = () => {
      if (containerRef.current) {
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.zIndex = '1'; // Sous les annotations
        
        // Ajoutez l'image au conteneur
        containerRef.current.appendChild(img);
        setIsDocumentLoading(false);
      }
    };
    
    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image:", url);
      setIsDocumentLoading(false);
      toast.error("Impossible de charger l'image");
    };
    
    img.src = url;
  };
  
  // Fonction pour le rendu de PDFs
  const renderPdfDocument = async (url: string) => {
    try {
      // Si vous utilisez PDF.js, chargez le PDF ici
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.top = '0';
      pdfContainer.style.left = '0';
      pdfContainer.style.width = '100%';
      pdfContainer.style.height = '100%';
      pdfContainer.style.zIndex = '1';
      
      // Si PDF.js n'est pas disponible, on peut afficher une iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      pdfContainer.appendChild(iframe);
      
      if (containerRef.current) {
        // Nettoyer le contenu précédent
        const existingPdf = containerRef.current.querySelector('div[data-pdf-container]');
        if (existingPdf) {
          existingPdf.remove();
        }
        
        pdfContainer.setAttribute('data-pdf-container', 'true');
        containerRef.current.appendChild(pdfContainer);
      }
      
      setIsDocumentLoading(false);
    } catch (error) {
      console.error("Erreur lors du rendu du PDF:", error);
      setIsDocumentLoading(false);
      toast.error("Impossible de charger le PDF");
    }
  };

  // Définition des classes et styles pour le conteneur principal
  const documentStyle = {
    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
    transition: isDragging ? "none" : "transform 0.3s ease",
  };

  return (
    <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 h-full">
      {/* Toolbar */}
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
                <Annotation className="h-4 w-4 mr-1" /> Annoter
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            title="Plein écran"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Container */}
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
          {/* Document Content */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={documentStyle}
          >
            {/* Le document est rendu dynamiquement ici par renderImageDocument ou renderPdfDocument */}
            {isDocumentLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <span className="mt-2 text-sm text-muted-foreground">
                    Chargement du document...
                  </span>
                </div>
              </div>
            )}
            
            {!activeDocument && !isDocumentLoading && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="mb-4 text-muted-foreground">
                  Aucun document sélectionné.
                </p>
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer un document
                </Button>
              </div>
            )}
          </div>

          {/* Annotations */}
          {renderAnnotations()}

          {/* Instruction for adding annotation */}
          {isAddingAnnotation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background border p-2 rounded-md shadow-md z-50">
              <p className="text-sm text-center">
                Cliquez sur le plan pour ajouter une annotation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Uploader */}
      <FileUploader
        onDocumentUpdate={onDocumentUpdate}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};
