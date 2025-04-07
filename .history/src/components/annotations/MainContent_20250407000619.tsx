import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  RotateCw,
  Upload,
  Maximize,
  MessageSquarePlus,
  MoveHorizontal,
  X,
} from "lucide-react";
import { Document, Annotation } from "./types";
import { FileUploader } from "./components/FileUploader";
import { CanvasControls } from "./components/CanvasControls";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Gestion du zoom sur le DOCUMENT
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  // Rotation du DOCUMENT
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Déplacer le DOCUMENT (pas les annotations)
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

  // Ajouter une annotation - calcul correct de la position
  const handleClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation || !containerRef.current) return;

    // Obtenir la position relative au conteneur
    const rect = containerRef.current.getBoundingClientRect();

    // Calculer la position dans le document (inverse des transformations)
    // Important: diviser par zoom pour obtenir les coordonnées à l'échelle 1:1
    const x = (e.clientX - rect.left - dragOffset.x) / zoomLevel;
    const y = (e.clientY - rect.top - dragOffset.y) / zoomLevel;

    onAddAnnotation({ x, y });
    setIsAddingAnnotation(false);
  };

  // Ouvrir l'input file
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Rendu des annotations avec positionnement correct
  const renderAnnotations = () => {
    if (!annotations || annotations.length === 0) return null;
    
    return annotations.map((ann) => {
      const isSelected = selectedAnnotation?.id === ann.id;
      
      // Position des annotations qui suit les transformations du document
      const x = (ann.x || ann.position?.x || 0) * zoomLevel + dragOffset.x;
      const y = (ann.y || ann.position?.y || 0) * zoomLevel + dragOffset.y;
      
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
            left: x,
            top: y,
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
    });
  };

  return (
    <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 h-full">
      {/* Toolbar - avec les boutons qui commandent le document */}
      <div className="bg-card border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={isAddingAnnotation ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
            title="Ajouter une annotation">
            {isAddingAnnotation ? (
              <>
                <X className="h-4 w-4 mr-1" /> Annuler
              </>
            ) : (
              <>
                <MessageSquarePlus className="h-4 w-4 mr-1" /> Annoter
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.1)}
            title="Zoom avant">
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            title="Zoom arrière">
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title="Rotation">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant={isDragging ? "default" : "outline"}
            size="sm"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            title="Déplacer">
            <MoveHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            title="Importer un document">
            <Upload className="h-4 w-4 mr-1" /> Importer
          </Button>
        </div>
      </div>

      {/* Conteneur principal avec le document et les annotations */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={containerRef}
          className={`w-full h-full relative ${
            isAddingAnnotation
              ? "cursor-crosshair"
              : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}>
          {/* DOCUMENT CONTAINER - Appliquer les transformations ICI */}
          <div
            ref={documentContainerRef}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease",
              marginLeft: dragOffset.x,
              marginTop: dragOffset.y,
              zIndex: 1,
            }}>
            {/* Contenu du document avec le bon z-index */}
            {activeDocument &&
            activeDocument.url &&
            activeDocument.url !== "/placeholder.svg" ? (
              activeDocument.type === "pdf" ? (
                <iframe
                  src={activeDocument.url}
                  title={activeDocument.name}
                  style={{
                    width: "900px", // Taille fixe pour éviter les problèmes de mise à l'échelle
                    height: "700px",
                    border: "none",
                    background: "white",
                    minWidth: "600px",
                  }}
                />
              ) : (
                <img
                  src={activeDocument.url}
                  alt={activeDocument.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    minWidth: "600px",
                  }}
                />
              )
            ) : (
              <div
                className="bg-muted flex items-center justify-center p-8 rounded-lg"
                style={{ width: "600px", height: "400px" }}>
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {activeDocument
                      ? "Document sans contenu valide"
                      : "Aucun document sélectionné"}
                  </p>
                  <Button onClick={handleUploadClick} className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer un document
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Annotations dans un calque séparé au-dessus du document */}
          {renderAnnotations()}

          {/* Message d'instruction en mode annotation */}
          {isAddingAnnotation && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background border p-2 rounded-md shadow-md z-[200]">
              <p className="text-sm">
                Cliquez sur le plan pour ajouter une annotation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input file caché pour l'importation de documents */}
      <FileUploader
        onDocumentUpdate={onDocumentUpdate}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};
