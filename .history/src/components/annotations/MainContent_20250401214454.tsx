import React from "react";
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
  onDocumentUpdate: (url: string) => void;
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
        document={activeDocument}
        annotations={activeDocument.annotations}
        onAddAnnotation={onAddAnnotation}
        onDocumentUpdate={onDocumentUpdate}
        onAnnotationClick={onAnnotationClick}
        selectedAnnotation={selectedAnnotation}
        projectId={projectId || "1"}
      />
    </div>
  );
};
