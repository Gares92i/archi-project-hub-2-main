import { useState, useCallback, useRef } from 'react';
import { Document, Annotation } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: Document[]) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [activeDocument, setActiveDocument] = useState<Document | null>(documents[0] || null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const documentChangeRef = useRef<number>(0);

  // Fonction pour sélectionner un document
  const handleSelectDocument = useCallback((document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  // Fonction pour ajouter un nouveau document
  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    console.log('Adding new document:', { url, name, type });
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name,
      type,
      url,
      annotations: []
    };
    
    setDocuments(prev => {
      console.log('Previous documents:', prev);
      const updated = [...prev, newDocument];
      console.log('Updated documents:', updated);
      return updated;
    });
    
    setActiveDocument(newDocument);
    console.log('New active document set:', newDocument);
  }, []);

  // Utiliser useAnnotationsHandler pour les autres fonctions
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
    addNewDocument, // Exposer cette fonction
    ...handlers
  };
};
