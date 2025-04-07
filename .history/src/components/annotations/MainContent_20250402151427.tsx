import React from 'react';
import { Document, Annotation } from './types';
import { PlanViewer } from './PlanViewer';
import { EmptyState } from './EmptyState';

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void; // Mise à jour ici pour rendre filename optionnel
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
  if (!activeDocument) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <PlanViewer
        key={activeDocument.id} 
        document={activeDocument}
        annotations={annotations}
        selectedAnnotation={selectedAnnotation}
        onAddAnnotation={onAddAnnotation}
        onDocumentUpdate={onDocumentUpdate}
        onAnnotationClick={onAnnotationClick}
      />
    </div>
  );
};
