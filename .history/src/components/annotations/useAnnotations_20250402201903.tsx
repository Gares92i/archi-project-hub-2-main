import { useState, useCallback } from 'react';
import { Document, Annotation } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

// Assurez-vous que l'interface Document a un type limité
export interface Document {
  id: string;
  name: string;
  type: "pdf" | "img";  // Limité à ces deux valeurs seulement
  url: string;
  annotations: Annotation[];
}

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

  // Corriger pour accepter le bon type
  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    console.log('Adding new document:', { name, type });
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name,
      type, // Type est maintenant correctement typé
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
    setDocuments, // Exposer setDocuments pour le bouton de débogage
    ...handlers
  };
};
