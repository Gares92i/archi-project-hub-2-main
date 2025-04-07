import { useState, useCallback } from 'react';
import { Annotation, Document } from '../types';
import { toast } from 'sonner';

interface UseAnnotationsHandlerProps {
  documents: Document[];
  activeDocument: Document | null;
  setDocuments: (documents: Document[]) => void;
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
  setIsAnnotationDialogOpen
}: UseAnnotationsHandlerProps) => {

  const handleAddAnnotation = useCallback((position: { x: number; y: number }) => {
    if (!activeDocument) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      position,
      comment: "",
      author: "Utilisateur actuel",
      date: new Date().toLocaleDateString('fr-FR'),
      isResolved: false,
      photos: [],
      projectId: activeDocument.id
    };
    
    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc => 
        doc.id === activeDocument.id 
          ? { ...doc, annotations: [...doc.annotations, newAnnotation] } 
          : doc
      );
      
      return updatedDocuments;
    });
    
    // Mise à jour du document actif et de l'annotation sélectionnée en dehors du setDocuments
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument({ ...updatedDocument, annotations: [...updatedDocument.annotations, newAnnotation] });
      }
      setSelectedAnnotation(newAnnotation);
      setIsAnnotationDialogOpen(true);
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation, setIsAnnotationDialogOpen]);

  const handleToggleResolved = useCallback((id: string) => {
    if (!activeDocument) return;

    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc => 
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id 
                  ? { ...annotation, isResolved: !annotation.isResolved } 
                  : annotation
              )
            }
          : doc
      );
      
      return updatedDocuments;
    });
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument(updatedDocument);
        const updatedAnnotation = updatedDocument.annotations.find(ann => ann.id === id);
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  const handleDocumentUpdate = useCallback((url: string, filename: string = "Nouveau document") => {
    if (!activeDocument) return;
    
    console.log('Updating document with URL and name:', url, filename);
    
    const type = url.startsWith('data:application/pdf') ? 'pdf' : 'img';
    
    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? { ...doc, url, name: filename, type }
          : doc
      );
      
      return updatedDocuments;
    });
    
    // Mise à jour du document actif
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument({ ...updatedDocument, url, name: filename, type });
      }
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument]);

  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, [setSelectedAnnotation, setIsAnnotationDialogOpen]);

  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
  }, [setSelectedAnnotation]);

  // Correction des types pour handleAddPhoto
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;
    
    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id
                  ? { ...annotation, photos: [...annotation.photos, photoUrl] }
                  : annotation
              )
            }
          : doc
      );

      return updatedDocuments;
    });
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument(updatedDocument);
        const updatedAnnotation = updatedDocument.annotations.find(ann => ann.id === id);
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Correction des types pour handleRemovePhoto
  const handleRemovePhoto = useCallback((id: string, photoIndex: number) => {
    if (!activeDocument) return;
    
    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id
                  ? { 
                      ...annotation, 
                      photos: annotation.photos.filter((_, index) => index !== photoIndex) 
                    }
                  : annotation
              )
            }
          : doc
      );
      
      return updatedDocuments;
    });
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument(updatedDocument);
        const updatedAnnotation = updatedDocument.annotations.find(ann => ann.id === id);
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Correction des types pour handleUpdateComment
  const handleUpdateComment = useCallback((id: string, comment: string) => {
    if (!activeDocument) return;
    
    // Correction du typage ici
    setDocuments((prevDocuments: Document[]) => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id
                  ? { ...annotation, comment }
                  : annotation
              )
            }
          : doc
      );
      
      return updatedDocuments;
    });
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    setTimeout(() => {
      const updatedDocument = documents.find(doc => doc.id === activeDocument.id);
      if (updatedDocument) {
        setActiveDocument(updatedDocument);
        const updatedAnnotation = updatedDocument.annotations.find(ann => ann.id === id);
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
    }, 0);
    
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  return {
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment
  };
};