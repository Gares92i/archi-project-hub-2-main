import React, { useState, useCallback } from "react";
import { Annotation, Document } from "../types";
import { toast } from "sonner";

interface UseAnnotationsHandlerProps {
  documents: Document[];
  activeDocument: Document | null;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setActiveDocument: (document: Document | null) => void;
  setSelectedAnnotation: (annotation: Annotation | null) => void;
  setIsAnnotationDialogOpen: (isOpen: boolean) => void;
}

export const useAnnotationsHandler = ({
  documents,
  activeDocument,
  setDocuments,
  setActiveDocument,
  setSelectedAnnotation,
  setIsAnnotationDialogOpen,
}: UseAnnotationsHandlerProps) => {
  const handleAddAnnotation = useCallback(
    (position: { x: number; y: number }) => {
      if (!activeDocument) return;

      // Créer l'annotation selon le format attendu dans le type Annotation
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        x: position.x,             // Utilise x au lieu de position
        y: position.y,             // Utilise y au lieu de position
        position,                  // Garde position pour compatibilité si nécessaire
        comment: "",
        author: "Utilisateur actuel",
        date: new Date().toLocaleDateString("fr-FR"),
        resolved: false,           // Utilise resolved au lieu de isResolved
        isResolved: false,         // Garde isResolved pour compatibilité si nécessaire
        photos: [],
        projectId: activeDocument.id,
      };

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) =>
          doc.id === activeDocument.id
            ? { ...doc, annotations: [...doc.annotations, newAnnotation] }
            : doc
        );

        return updatedDocuments;
      });

      setTimeout(() => {
        const updatedDocument = documents.find(
          (doc) => doc.id === activeDocument.id
        );
        if (updatedDocument) {
          setActiveDocument({
            ...updatedDocument,
            annotations: [...updatedDocument.annotations, newAnnotation],
          });
        }
        setSelectedAnnotation(newAnnotation);
        setIsAnnotationDialogOpen(true);
      }, 0);
    },
    [
      activeDocument,
      documents,
      setDocuments,
      setActiveDocument,
      setSelectedAnnotation,
      setIsAnnotationDialogOpen,
    ]
  );

  const handleToggleResolved = useCallback(
    (id: string) => {
      if (!activeDocument) return;

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) =>
          doc.id === activeDocument.id
            ? {
                ...doc,
                annotations: doc.annotations.map((annotation) =>
                  annotation.id === id
                    ? { 
                        ...annotation, 
                        resolved: !annotation.resolved,       // Propriété principale
                        isResolved: !annotation.isResolved    // Pour compatibilité si nécessaire
                      }
                    : annotation
                ),
              }
            : doc
        );

        return updatedDocuments;
      });

      setTimeout(() => {
        const updatedDocument = documents.find(
          (doc) => doc.id === activeDocument.id
        );
        if (updatedDocument) {
          setActiveDocument(updatedDocument);
          const updatedAnnotation = updatedDocument.annotations.find(
            (ann) => ann.id === id
          );
          if (updatedAnnotation) {
            setSelectedAnnotation(updatedAnnotation);
          }
        }
      }, 0);
    },
    [
      activeDocument,
      documents,
      setDocuments,
      setActiveDocument,
      setSelectedAnnotation,
    ]
  );

  const handleDocumentUpdate = useCallback(
    (url: string, filename: string = "Nouveau document") => {
      if (!activeDocument) {
        console.error("Impossible de mettre à jour le document: aucun document actif");
        return;
      }

      console.log('Updating document with URL and name:', url.substring(0, 50) + '...', filename);
      
      // Utiliser une assertion de type pour garantir que type est 'pdf' ou 'img'
      const type = url.startsWith('data:application/pdf') ? 'pdf' as const : 'img' as const;
      
      // Approche directe pour la mise à jour avec le type correct
      const updatedDocuments = documents.map(doc =>
        doc.id === activeDocument.id
          ? { ...doc, url, name: filename, type }
          : doc
      );
      
      setDocuments(updatedDocuments);
      console.log('Documents updated after modification');
      
      // Mise à jour directe du document actif
      const updatedDoc = { ...activeDocument, url, name: filename, type };
      setActiveDocument(updatedDoc);
      console.log('Active document updated:', updatedDoc.name);
    },
    [activeDocument, documents, setDocuments, setActiveDocument]
  );

  const handleAnnotationClick = useCallback(
    (annotation: Annotation) => {
      setSelectedAnnotation(annotation);
      setIsAnnotationDialogOpen(true);
    },
    [setSelectedAnnotation, setIsAnnotationDialogOpen]
  );

  const handleHighlightAnnotation = useCallback(
    (annotation: Annotation) => {
      setSelectedAnnotation(annotation);
    },
    [setSelectedAnnotation]
  );

  const handleAddPhoto = useCallback(
    (id: string, photoUrl: string) => {
      if (!activeDocument) return;

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) =>
          doc.id === activeDocument.id
            ? {
                ...doc,
                annotations: doc.annotations.map((annotation) =>
                  annotation.id === id
                    ? {
                        ...annotation,
                        photos: [...annotation.photos, photoUrl],
                      }
                    : annotation
                ),
              }
            : doc
        );

        return updatedDocuments;
      });

      setTimeout(() => {
        const updatedDocument = documents.find(
          (doc) => doc.id === activeDocument.id
        );
        if (updatedDocument) {
          setActiveDocument(updatedDocument);
          const updatedAnnotation = updatedDocument.annotations.find(
            (ann) => ann.id === id
          );
          if (updatedAnnotation) {
            setSelectedAnnotation(updatedAnnotation);
          }
        }
      }, 0);
    },
    [
      activeDocument,
      documents,
      setDocuments,
      setActiveDocument,
      setSelectedAnnotation,
    ]
  );

  const handleRemovePhoto = useCallback(
    (id: string, photoIndex: number) => {
      if (!activeDocument) return;

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) =>
          doc.id === activeDocument.id
            ? {
                ...doc,
                annotations: doc.annotations.map((annotation) =>
                  annotation.id === id
                    ? {
                        ...annotation,
                        photos: annotation.photos.filter(
                          (_, index) => index !== photoIndex
                        ),
                      }
                    : annotation
                ),
              }
            : doc
        );

        return updatedDocuments;
      });

      setTimeout(() => {
        const updatedDocument = documents.find(
          (doc) => doc.id === activeDocument.id
        );
        if (updatedDocument) {
          setActiveDocument(updatedDocument);
          const updatedAnnotation = updatedDocument.annotations.find(
            (ann) => ann.id === id
          );
          if (updatedAnnotation) {
            setSelectedAnnotation(updatedAnnotation);
          }
        }
      }, 0);
    },
    [
      activeDocument,
      documents,
      setDocuments,
      setActiveDocument,
      setSelectedAnnotation,
    ]
  );

  const handleUpdateComment = useCallback(
    (id: string, comment: string) => {
      if (!activeDocument) return;

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) =>
          doc.id === activeDocument.id
            ? {
                ...doc,
                annotations: doc.annotations.map((annotation) =>
                  annotation.id === id ? { ...annotation, comment } : annotation
                ),
              }
            : doc
        );

        return updatedDocuments;
      });

      setTimeout(() => {
        const updatedDocument = documents.find(
          (doc) => doc.id === activeDocument.id
        );
        if (updatedDocument) {
          setActiveDocument(updatedDocument);
          const updatedAnnotation = updatedDocument.annotations.find(
            (ann) => ann.id === id
          );
          if (updatedAnnotation) {
            setSelectedAnnotation(updatedAnnotation);
          }
        }
      }, 0);
    },
    [
      activeDocument,
      documents,
      setDocuments,
      setActiveDocument,
      setSelectedAnnotation,
    ]
  );

  return {
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
  };
};
