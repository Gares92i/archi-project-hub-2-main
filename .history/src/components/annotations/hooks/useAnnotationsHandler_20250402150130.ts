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

  // Handler pour ajouter une annotation
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
    
    setDocuments(prevDocuments => {
      const updatedDocuments = prevDocuments.map(doc => 
        doc.id === activeDocument.id 
          ? { ...doc, annotations: [...doc.annotations, newAnnotation] } 
          : doc
      );
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
      }
      
      return updatedDocuments;
    });
    
    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDialogOpen(true);
    
  }, [activeDocument, setDocuments, setActiveDocument, setSelectedAnnotation, setIsAnnotationDialogOpen]);

  // Handler pour basculer l'état résolu/non résolu
  const handleToggleResolved = useCallback((id: string) => {
    if (!activeDocument) return;

    setDocuments(prevDocuments => {
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
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
        
        // Mise à jour de l'annotation sélectionnée
        const updatedAnnotation = updatedActiveDoc.annotations.find(ann => ann.id === id) || null;
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
      
      return updatedDocuments;
    });
    
  }, [activeDocument, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Modifier la fonction handleDocumentUpdate
  const handleDocumentUpdate = useCallback((url: string, filename: string = "Nouveau document") => {
    if (!activeDocument) return;
    
    console.log('Updating document with URL and name:', url, filename);
    
    const type = url.startsWith('data:application/pdf') ? 'pdf' : 'img';
    
    setDocuments(prevDocuments => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? { ...doc, url, name: filename, type }
          : doc
      );
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
      }
      
      return updatedDocuments;
    });
    
  }, [activeDocument, setDocuments, setActiveDocument]);

  // Handler pour cliquer sur une annotation
  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, [setSelectedAnnotation, setIsAnnotationDialogOpen]);

  // Handler pour mettre en évidence une annotation
  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
  }, [setSelectedAnnotation]);

  // Handler pour ajouter une photo
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;
    
    setDocuments(prevDocuments => {
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
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
        
        // Mise à jour de l'annotation sélectionnée
        const updatedAnnotation = updatedActiveDoc.annotations.find(ann => ann.id === id) || null;
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
      
      return updatedDocuments;
    });
    
  }, [activeDocument, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Handler pour supprimer une photo
  const handleRemovePhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;
    
    setDocuments(prevDocuments => {
      const updatedDocuments = prevDocuments.map(doc =>
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id
                  ? { 
                      ...annotation, 
                      photos: annotation.photos.filter(photo => photo !== photoUrl) 
                    }
                  : annotation
              )
            }
          : doc
      );
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
        
        // Mise à jour de l'annotation sélectionnée
        const updatedAnnotation = updatedActiveDoc.annotations.find(ann => ann.id === id) || null;
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
      
      return updatedDocuments;
    });
    
  }, [activeDocument, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Handler pour mettre à jour un commentaire
  const handleUpdateComment = useCallback((id: string, comment: string) => {
    if (!activeDocument) return;
    
    setDocuments(prevDocuments => {
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
      
      // Mise à jour du document actif
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      if (updatedActiveDoc) {
        setActiveDocument(updatedActiveDoc);
        
        // Mise à jour de l'annotation sélectionnée
        const updatedAnnotation = updatedActiveDoc.annotations.find(ann => ann.id === id) || null;
        if (updatedAnnotation) {
          setSelectedAnnotation(updatedAnnotation);
        }
      }
      
      return updatedDocuments;
    });
    
  }, [activeDocument, setDocuments, setActiveDocument, setSelectedAnnotation]);

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

