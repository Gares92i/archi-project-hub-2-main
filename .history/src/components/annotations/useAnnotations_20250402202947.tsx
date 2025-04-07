import { useState, useCallback } from 'react';
import { Annotation } from './types';
// Importer le type Document avec un alias pour éviter le conflit
import { Document as DocumentType } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: DocumentType[]) => {
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

  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    console.log('Adding new document:', { name, type });
    
    const newDocument: DocumentType = {
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
    addNewDocument,
    setDocuments,
    ...handlers
  };
};
