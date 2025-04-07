import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Annotation } from './types';
import { Document as DocumentType } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: DocumentType[], projectId?: string) => {
  const [documents, setDocuments] = useState<DocumentType[]>(initialDocuments);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    initialDocuments.length > 0 ? initialDocuments[0] : null
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  const handleSelectDocument = useCallback((document: DocumentType) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  // Utiliser le hook existant avec projectId
  const {
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
    saveAnnotationsState,
    loadAnnotationsState
  } = useAnnotationsHandler({
    documents,
    activeDocument,
    setDocuments,
    setActiveDocument,
    setSelectedAnnotation,
    setIsAnnotationDialogOpen,
    projectId // Passer le projectId
  });
  
  // Fonction pour convertir une annotation en tâche
  const handleConvertToTask = useCallback((annotationId: string) => {
    console.log('Conversion de l\'annotation en tâche:', annotationId);
    toast.info('Fonctionnalité de conversion en tâche');
    // Implémentation à compléter
  }, []);

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
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
    handleConvertToTask,
    saveAnnotationsState,
    loadAnnotationsState
  };
};
