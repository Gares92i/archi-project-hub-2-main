import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  RotateCw,
  Upload,
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
  const documentContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  // Debug: afficher les annotations disponibles
  useEffect(() => {
    console.log("MainContent - annotations disponibles:", annotations.length);
  }, [annotations.length]);

  // Gestion du zoom sur le document
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  };

  // Rotation du document
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Déplacer le document (pas les annotations)
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

  // Ajouter une annotation avec la position relative correcte
  const handleClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation || !containerRef.current || !documentContentRef.current) return;
    
    // Calculer la position relative au document, pas au conteneur
    const docRect = documentContentRef.current.getBoundingClientRect();
    
    const x = (e.clientX - docRect.left) / docRect.width;
    const y = (e.clientY - docRect.top) / docRect.height;
    
    // Vérifier que le clic est bien sur le document
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      console.log("Ajout d'annotation à la position:", { x, y });
      onAddAnnotation({ x, y });
      setIsAddingAnnotation(false);
    }
  };

  // Ouvrir l'input file
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
          {/* Document content */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease",
              marginLeft: dragOffset.x,
              marginTop: dragOffset.y,
              position: "relative"
            }}
          >
            {/* Document display */}
            <div
              ref={documentContentRef}
              className="relative"
              style={{ 
                position: "relative",
                zIndex: 10
              }}
            >
              {activeDocument && activeDocument.url && activeDocument.url !== '/placeholder.svg' ? (
                activeDocument.type === "pdf" ? (
                  <iframe
                    src={activeDocument.url}
                    title={activeDocument.name || "Document"}
                    style={{
                      width: "900px",
                      height: "700px",
                      border: "none",
                      background: "white"
                    }}
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={activeDocument.url}
                      alt={activeDocument.name || "Document"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        minWidth: "600px",
                        objectFit: "contain"
                      }}
                    />
                    
                    {/* Annotations sur l'image - positionnées en % */}
                    {annotations && annotations.length > 0 && annotations.map((ann) => {
                      const isSelected = selectedAnnotation?.id === ann.id;
                      
                      // Position relative en % de la largeur et hauteur de l'image
                      const x = (ann.x || ann.position?.x || 0) * 100;
                      const y = (ann.y || ann.position?.y || 0) * 100;
                      
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
                            left: `${x}%`,
                            top: `${y}%`,
                            zIndex: 100
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
                    })}
                  </div>
                )
              ) : (
                <div className="bg-muted flex items-center justify-center p-8 rounded-lg" style={{ width: "600px", height: "400px" }}>
                  <div className="text-center">
                    <p className="mb-4 text-muted-foreground">
                      {activeDocument ? "Document sans contenu valide" : "Aucun document sélectionné"}
                    </p>
                    <Button onClick={handleUploadClick}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer un document
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Afficher les annotations directement sur les PDF */}
            {activeDocument && activeDocument.type === "pdf" && annotations && annotations.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {annotations.map((ann) => {
                  const isSelected = selectedAnnotation?.id === ann.id;
                  const x = (ann.x || ann.position?.x || 0) * 100;
                  const y = (ann.y || ann.position?.y || 0) * 100;
                  
                  return (
                    <div
                      key={ann.id}
                      className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all border-2 pointer-events-auto ${
                        isSelected
                          ? "bg-primary border-primary-foreground w-6 h-6 z-30"
                          : ann.resolved || ann.isResolved
                          ? "bg-green-500 border-white w-5 h-5 z-20"
                          : "bg-red-500 border-white w-5 h-5 z-20"
                      }`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        zIndex: 100
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
                })}
              </div>
            )}
          </div>

          {/* Message d'aide pour l'ajout d'annotation */}
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
