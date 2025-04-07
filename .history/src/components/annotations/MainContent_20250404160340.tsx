import React, { useEffect, useCallback, useRef } from "react";
import { PlanViewer } from "./PlanViewer";
import { Document, Annotation } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void; // Ajoutez filename
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
  const isMobile = useIsMobile();
  const { id: projectId } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debugging pour l'upload de fichiers
  useEffect(() => {
    if (fileInputRef.current) {
      const originalAddEventListener = fileInputRef.current.addEventListener;
      fileInputRef.current.addEventListener = function(type, listener, options) {
        if (type === 'change') {
          console.log('Écouteur change ajouté au input file');
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    }
  }, [fileInputRef]);

  // Lors de l'appel à onDocumentUpdate
  const handleFileSelected = useCallback((url: string, filename?: string) => {
    console.log("MainContent: handleFileSelected appelé avec", {
      filename: filename || "sans nom",
      urlLength: url.length,
      type: url.substring(0, 30) + "..."
    });

    if (onDocumentUpdate) {
      onDocumentUpdate(url, filename);
    }
  }, [onDocumentUpdate]);

  if (!activeDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Aucun document sélectionné</p>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full", isMobile ? "p-2" : "p-4")}>
      <PlanViewer
        key={activeDocument.id}
        document={activeDocument || { id: "0", name: "Aucun document", url: "", type: "pdf", annotations: [] }}
        annotations={annotations}
        onAddAnnotation={onAddAnnotation}
        onDocumentUpdate={handleFileSelected}
        onAnnotationClick={onAnnotationClick}
        selectedAnnotation={selectedAnnotation}
        projectId={projectId || "1"}
      />
    </div>
  );
};
