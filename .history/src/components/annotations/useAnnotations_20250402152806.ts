import { useState, useCallback } from 'react';
import { Document, Annotation } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: Document[]) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeDocument, setActiveDocument] = useState<Document | null>(
    initialDocuments.length > 0 ? initialDocuments[0] : null
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  const handleSelectDocument = useCallback((document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  // La fonction pour ajouter un nouveau document
  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name,
      type,
      url,
      annotations: []
    };
    
    setDocuments(prev => [...prev, newDocument]);
    setActiveDocument(newDocument);
  }, []);

  const handlers = useAnnotationsHandler({
    documents,
    activeDocument,
    setDocuments,
    setActiveDocument,
    setSelectedAnnotation,
    setIsAnnotationDialogOpen
  });

  return {
    documents,
    activeDocument,
    selectedAnnotation,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen,
    handleSelectDocument,
    addNewDocument, // Exposer la fonction
    ...handlers
  };
};