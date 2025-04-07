import React, { useRef, useState } from "react";
import { Document, Annotation } from "./types";
import { PdfViewer } from "./PdfViewer";
import { ImageViewer } from "./ImageViewer";
import { AnnotationMarker } from "./AnnotationMarker";
import { AddFileButton } from "./AddFileButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Move, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onDeleteAnnotation?: (annotation: Annotation) => void;
  onRepositionAnnotation?: (
    id: string,
    newPosition: { x: number; y: number }
  ) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeDocument,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
  onDeleteAnnotation,
  onRepositionAnnotation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isRepositioningAnnotation, setIsRepositioningAnnotation] = useState<
    string | null
  >(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [scrollPosition, setScrollPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Vérifier si c'est un document PDF ou une image
  const isPdf = activeDocument?.type === "pdf";
  const hasDocument = !!activeDocument?.url;

  const handleAddAnnotationClick = () => {
    setIsAddingAnnotation(!isAddingAnnotation);
    setIsRepositioningAnnotation(null);
    setIsMoveMode(false);
  };

  const handleRepositionClick = (annotationId: string) => {
    setIsRepositioningAnnotation(annotationId);
    setIsAddingAnnotation(false);
    setIsMoveMode(false);
  };

  const handleMoveClick = () => {
    setIsMoveMode(!isMoveMode);
    setIsAddingAnnotation(false);
    setIsRepositioningAnnotation(null);
  };

  const handleDeleteClick = (annotation: Annotation) => {
    if (onDeleteAnnotation) {
      console.log("Demande de suppression de l'annotation:", annotation);
      onDeleteAnnotation(annotation);
    }
  };
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  // Cette fonction convertit les coordonnées du clic en pourcentages
  // Elle tient compte du zoom et du scroll
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMoveMode) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Ajuster les coordonnées en fonction du niveau de zoom
    const viewportX = e.clientX - rect.left;
    const viewportY = e.clientY - rect.top;

    // Ajuster pour le zoom
    const contentWidth = rect.width / zoomLevel;
    const contentHeight = rect.height / zoomLevel;

    // Calculer le point cliqué en pourcentage du document
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    const x = ((viewportX + scrollLeft) / (contentWidth * zoomLevel)) * 100;
    const y = ((viewportY + scrollTop) / (contentHeight * zoomLevel)) * 100;

    console.log("Clic sur le document aux coordonnées:", { x, y });

    if (isAddingAnnotation) {
      onAddAnnotation({ x, y });
      setIsAddingAnnotation(false);
    } else if (isRepositioningAnnotation && onRepositionAnnotation) {
      onRepositionAnnotation(isRepositioningAnnotation, { x, y });
      setIsRepositioningAnnotation(null);
    }
  };

  // Gérer le déplacement avec la souris
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMoveMode || !containerRef.current) return;
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMoveMode || !dragStart || !containerRef.current) return;
    e.preventDefault();

    const container = containerRef.current;
    const dx = dragStart.x - e.clientX;
    const dy = dragStart.y - e.clientY;

    setDragStart({ x: e.clientX, y: e.clientY });

    container.scrollLeft += dx;
    container.scrollTop += dy;
    setScrollPosition({ x: container.scrollLeft, y: container.scrollTop });
  };

  const handleMouseUp = () => {
    setDragStart(null);
    if (containerRef.current) {
      containerRef.current.style.cursor = isMoveMode ? "grab" : "default";
    }
  };

  // Trier les annotations par ordre de création (ou par ID si pas de date)
  const sortedAnnotations = [...annotations].sort((a, b) => {
    const dateA = a.createdAt || a.date || "";
    const dateB = b.createdAt || b.date || "";
    return dateA.localeCompare(dateB);
  });

  if (!hasDocument) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <AddFileButton onDocumentUpdate={onDocumentUpdate} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-muted py-1 px-3 flex items-center justify-between">
        <div className="text-sm font-medium truncate flex-1 overflow-hidden">
          {activeDocument?.name || "Document sans titre"}
        </div>
        <div className="flex items-center space-x-2">
          {/* Contrôles de zoom et rotation */}
          <div className="flex items-center mr-4 bg-background/70 rounded-md px-1.5 py-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleZoomOut}
              title="Zoom arrière">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs mx-2">{Math.round(zoomLevel * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleZoomIn}
              title="Zoom avant">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={handleRotate}
              title="Rotation">
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={handleReset}
              title="Réinitialiser">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isRepositioningAnnotation && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Cliquez sur le document pour repositionner l'annotation
            </span>
          )}

          {isMoveMode && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Mode déplacement activé
            </span>
          )}

          <Button
            className={cn(
              "text-xs py-0.5 px-2 rounded-full transition-colors z-10",
              isMoveMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            )}
            onClick={handleMoveClick}
            size="sm"
            variant={isMoveMode ? "default" : "outline"}>
            <Move className="h-3 w-3 mr-1" />
            {isMoveMode ? "Arrêter" : "Déplacer"}
          </Button>

          <Button
            className={cn(
              "text-xs py-0.5 px-2 rounded transition-colors",
              isAddingAnnotation
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            )}
            onClick={handleAddAnnotationClick}
            size="sm"
            variant={isAddingAnnotation ? "default" : "outline"}>
            {isAddingAnnotation ? "Annuler" : "Ajouter une annotation"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-auto",
          isAddingAnnotation && "cursor-crosshair",
          isRepositioningAnnotation && "cursor-move",
          isMoveMode && "cursor-grab active:cursor-grabbing"
        )}
        onClick={handleDocumentClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        {isPdf ? (
          <PdfViewer url={activeDocument.url} />
        ) : (
          <ImageViewer url={activeDocument.url} />
        )}

        {/* Marqueurs d'annotation adaptés au zoom */}
        <div className="absolute inset-0 pointer-events-none">
          {sortedAnnotations.map((annotation, index) => {
            // S'assurer que les coordonnées sont des nombres valides
            const x =
              typeof annotation.x === "number"
                ? annotation.x
                : annotation.position?.x !== undefined
                ? annotation.position.x
                : 0;
            const y =
              typeof annotation.y === "number"
                ? annotation.y
                : annotation.position?.y !== undefined
                ? annotation.position.y
                : 0;

            return (
              <div key={annotation.id} className="group">
                <AnnotationMarker
                  x={x}
                  y={y}
                  selected={selectedAnnotation?.id === annotation.id}
                  resolved={annotation.resolved || annotation.isResolved}
                  annotationNumber={index + 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationClick(annotation);
                  }}
                  className="pointer-events-auto"
                  scaleWithZoom={true}
                />

                {/* Boutons d'action pour les annotations */}
                {selectedAnnotation?.id === annotation.id && (
                  <div
                    className="absolute pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `calc(${x}% + 15px)`,
                      top: `${y}%`,
                      transform: "translateY(-50%)",
                    }}>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-white shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepositionClick(annotation.id);
                        }}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-white shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(annotation);
                        }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
