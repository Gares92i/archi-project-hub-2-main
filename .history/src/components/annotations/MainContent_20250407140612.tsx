import React, { useRef, useState } from "react";
import { Document, Annotation } from "./types";
import { PdfViewer } from "./PdfViewer";
import { ImageViewer } from "./ImageViewer";
import { AnnotationMarker } from "./AnnotationMarker";
import { AddFileButton } from "./AddFileButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onDeleteAnnotation?: (annotation: Annotation) => void;
  onRepositionAnnotation?: (id: string, newPosition: { x: number; y: number }) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeDocument,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
  onDeleteAnnotation,
  onRepositionAnnotation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [isRepositioningAnnotation, setIsRepositioningAnnotation] = useState<string | null>(null);

  // Vérifier si c'est un document PDF ou une image
  const isPdf = activeDocument?.type === "pdf";
  const hasDocument = !!activeDocument?.url;

  const handleAddAnnotationClick = () => {
    setIsAddingAnnotation(!isAddingAnnotation);
    setIsRepositioningAnnotation(null);
  };

  const handleRepositionClick = (annotationId: string) => {
    setIsRepositioningAnnotation(annotationId);
    setIsAddingAnnotation(false);
  };

  const handleDeleteClick = (annotation: Annotation) => {
    if (onDeleteAnnotation) {
      console.log("Demande de suppression de l'annotation:", annotation);
      onDeleteAnnotation(annotation);
    }
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log("Clic sur le document:", { x, y });

    if (isAddingAnnotation) {
      onAddAnnotation({ x, y });
      setIsAddingAnnotation(false);
    } else if (isRepositioningAnnotation && onRepositionAnnotation) {
      console.log(`Repositionnement de l'annotation ${isRepositioningAnnotation} à:`, { x, y });
      onRepositionAnnotation(isRepositioningAnnotation, { x, y });
      setIsRepositioningAnnotation(null);
    }
  };

  // Trier les annotations par ordre de création (ou par ID si pas de date)
  const sortedAnnotations = [...annotations].sort((a, b) => {
    const dateA = a.createdAt || a.date || '';
    const dateB = b.createdAt || b.date || '';
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
        <div className="text-sm font-medium truncate">
          {activeDocument?.name || "Document sans titre"}
        </div>
        <div className="flex items-center space-x-2">
          {isRepositioningAnnotation && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Cliquez sur le document pour repositionner l'annotation
            </span>
          )}
          <button
            className={cn(
              "text-xs py-0.5 px-2 rounded transition-colors",
              isAddingAnnotation
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            )}
            onClick={handleAddAnnotationClick}
          >
            {isAddingAnnotation ? "Annuler" : "Ajouter une annotation"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-auto",
          isAddingAnnotation && "cursor-crosshair",
          isRepositioningAnnotation && "cursor-move"
        )}
        onClick={handleDocumentClick}
      >
        {isPdf ? (
          <PdfViewer url={activeDocument.url} />
        ) : (
          <ImageViewer url={activeDocument.url} />
        )}

        {/* Annotation markers */}
        <div className="absolute inset-0 pointer-events-none">
          {sortedAnnotations.map((annotation, index) => (
            <div key={annotation.id} className="group relative">
              <AnnotationMarker
                key={annotation.id}
                x={annotation.x}
                y={annotation.y}
                selected={selectedAnnotation?.id === annotation.id}
                resolved={annotation.resolved || annotation.isResolved}
                annotationNumber={index + 1} // Numéro d'annotation basé sur l'index + 1
                onClick={() => {
                  onAnnotationClick(annotation);
                }}
                className="pointer-events-auto"
              />
              
              {/* Boutons d'action sur les annotations */}
              {selectedAnnotation?.id === annotation.id && (
                <div className="absolute top-0 left-full ml-2 flex gap-1 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepositionClick(annotation.id);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(annotation);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
