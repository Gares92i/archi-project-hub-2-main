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

  // Handler pour ajouter une annotation à partir d'une position sur le canvas
  const handleAddAnnotation = useCallback((position: { x: number; y: number }) => {
    if (!activeDocument) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      position,
      comment: "Nouvelle annotation",
      author: "Utilisateur",
      date: new Date().toLocaleDateString(),
      isResolved: false,
      photos: [],
      projectId: activeDocument.id
    };
    
    const updatedDocuments = documents.map(doc => 
      doc.id === activeDocument.id 
        ? { ...doc, annotations: [...doc.annotations, newAnnotation] } 
        : doc
    );
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif avec ses annotations
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    // Sélectionner la nouvelle annotation et ouvrir le dialogue
    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDialogOpen(true);
    
    toast.success("Annotation ajoutée");
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation, setIsAnnotationDialogOpen]);

  // Handler pour basculer l'état résolu/non résolu d'une annotation
  const handleToggleResolved = useCallback((id: string) => {
    if (!activeDocument) return;

    const updatedDocuments = documents.map(doc => 
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
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    // Mise à jour de l'annotation sélectionnée si elle a été modifiée
    const updatedAnnotation = updatedActiveDoc?.annotations.find(ann => ann.id === id) || null;
    setSelectedAnnotation(prevSelected => 
      prevSelected?.id === id ? updatedAnnotation : prevSelected
    );
    
    toast.success(`Annotation marquée comme ${updatedAnnotation?.isResolved ? 'résolue' : 'non résolue'}`);
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Handler pour mettre à jour le document (par exemple lors du téléchargement d'un nouveau PDF)
  const handleDocumentUpdate = useCallback((url: string) => {
    if (!activeDocument) return;
    
    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id
        ? { ...doc, url }
        : doc
    );
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    toast.success("Document mis à jour");
  }, [activeDocument, documents, setDocuments, setActiveDocument]);

  // Handler pour cliquer sur une annotation pour la sélectionner
  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, [setSelectedAnnotation, setIsAnnotationDialogOpen]);

  // Handler pour mettre en évidence une annotation (peut être utilisé depuis la liste des annotations)
  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, [setSelectedAnnotation, setIsAnnotationDialogOpen]);

  // Handler pour ajouter une photo à une annotation
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;
    
    const updatedDocuments = documents.map(doc =>
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
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    const updatedAnnotation = updatedActiveDoc?.annotations.find(ann => ann.id === id) || null;
    setSelectedAnnotation(prevSelected => 
      prevSelected?.id === id ? updatedAnnotation : prevSelected
    );
    
    toast.success("Photo ajoutée à l'annotation");
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Handler pour supprimer une photo d'une annotation
  const handleRemovePhoto = useCallback((id: string, photoIndex: number) => {
    if (!activeDocument) return;
    
    const updatedDocuments = documents.map(doc =>
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
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    const updatedAnnotation = updatedActiveDoc?.annotations.find(ann => ann.id === id) || null;
    setSelectedAnnotation(prevSelected => 
      prevSelected?.id === id ? updatedAnnotation : prevSelected
    );
    
    toast.success("Photo supprimée de l'annotation");
  }, [activeDocument, documents, setDocuments, setActiveDocument, setSelectedAnnotation]);

  // Handler pour mettre à jour le commentaire d'une annotation
  const handleUpdateComment = useCallback((id: string, comment: string) => {
    if (!activeDocument) return;
    
    const updatedDocuments = documents.map(doc =>
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
    
    setDocuments(updatedDocuments);
    
    // Mise à jour du document actif et de l'annotation sélectionnée
    const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
    setActiveDocument(updatedActiveDoc);
    
    const updatedAnnotation = updatedActiveDoc?.annotations.find(ann => ann.id === id) || null;
    setSelectedAnnotation(prevSelected => 
      prevSelected?.id === id ? updatedAnnotation : prevSelected
    );
    
    toast.success("Commentaire mis à jour");
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

