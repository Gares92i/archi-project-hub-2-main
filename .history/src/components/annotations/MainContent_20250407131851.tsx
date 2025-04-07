import React, { useRef, useState } from "react";
import { Document, Annotation } from "./types";
import { PdfViewer } from "./PdfViewer";
import { ImageViewer } from "./ImageViewer";
import { AnnotationMarker } from "./AnnotationMarker";
import { AddFileButton } from "./AddFileButton";
import { cn } from "@/lib/utils";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename: string) => void;
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
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  // Vérifier si c'est un document PDF ou une image
  const isPdf = activeDocument?.type === "pdf";
  const hasDocument = !!activeDocument?.url;

  const handleAddAnnotationClick = () => {
    setIsAddingAnnotation(!isAddingAnnotation);
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingAnnotation || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddAnnotation({ x, y });
    setIsAddingAnnotation(false); // Désactiver le mode d'ajout après avoir placé une annotation
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
        <div className="flex items-center">
          <button
            className={cn(
              "text-xs py-0.5 px-2 rounded ml-2 transition-colors",
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
          isAddingAnnotation && "cursor-crosshair"
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
              // On désactive le pointerevent-none pour capturer le clic
              className="pointer-events-auto"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
