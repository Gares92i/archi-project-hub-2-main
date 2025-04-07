import { useState } from "react";
import { Document, Annotation } from "./types";

export function useAnnotations(initialDocuments: Document[]) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(
    initialDocuments.length > 0 ? initialDocuments[0].id : null
  );
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  const activeDocument =
    documents.find((doc) => doc.id === activeDocumentId) || null;

  const selectedAnnotation =
    activeDocument?.annotations.find(
      (ann) => ann.id === selectedAnnotationId
    ) || null;

  // Handler to select a document
  const handleSelectDocument = (document: Document) => {
    setActiveDocumentId(document.id);
    setSelectedAnnotationId(null);
  };

  // Handler to add a new annotation
  const handleAddAnnotation = (annotation: Annotation) => {
    if (!activeDocumentId) return;

    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === activeDocumentId
          ? {
              ...doc,
              annotations: [...doc.annotations, annotation],
            }
          : doc
      )
    );

    setSelectedAnnotationId(annotation.id);
    setIsAnnotationDialogOpen(true);
  };

  // Handler to toggle resolved status
  const handleToggleResolved = (annotationId: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) => ({
        ...doc,
        annotations: doc.annotations.map((ann) =>
          ann.id === annotationId ? { ...ann, resolved: !ann.resolved } : ann
        ),
      }))
    );
  };

  // Handler to update document
  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );
  };

  // Handler to highlight an annotation
  const handleHighlightAnnotation = (annotationId: string) => {
    setSelectedAnnotationId(annotationId);
    setIsAnnotationDialogOpen(true);
  };

  // Handler to add a photo to an annotation
  const handleAddPhoto = (annotationId: string, photoUrl: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) => ({
        ...doc,
        annotations: doc.annotations.map((ann) =>
          ann.id === annotationId
            ? {
                ...ann,
                photos: [...(ann.photos || []), photoUrl],
                updatedAt: new Date(),
              }
            : ann
        ),
      }))
    );
  };

  // Handler to remove a photo
  const handleRemovePhoto = (annotationId: string, photoUrl: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) => ({
        ...doc,
        annotations: doc.annotations.map((ann) =>
          ann.id === annotationId
            ? {
                ...ann,
                photos: (ann.photos || []).filter((p) => p !== photoUrl),
                updatedAt: new Date(),
              }
            : ann
        ),
      }))
    );
  };

  // Handler to update a comment
  const handleUpdateComment = (annotationId: string, text: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) => ({
        ...doc,
        annotations: doc.annotations.map((ann) =>
          ann.id === annotationId
            ? {
                ...ann,
                text,
                updatedAt: new Date(),
              }
            : ann
        ),
      }))
    );
  };

  return {
    documents,
    activeDocument,
    selectedAnnotation,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen,
    handleSelectDocument,
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
  };
}
