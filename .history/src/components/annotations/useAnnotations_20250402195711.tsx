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
    console.log('Adding new document:', { url: url.substring(0, 50) + '...', name, type });
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name,
      type,
      url,
      annotations: []
    };
    
    console.log('New document created:', newDocument);
    
    // Utiliser une approche plus directe
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    console.log('Documents updated:', updatedDocuments.length);
    
    // Définir le document actif directement
    setActiveDocument(newDocument);
    console.log('Active document set to:', newDocument.name);
  }, [documents]);

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
