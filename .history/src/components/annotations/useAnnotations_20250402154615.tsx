import { useState, useCallback, useRef } from 'react';
import { Document, Annotation } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: Document[]) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [activeDocument, setActiveDocument] = useState<Document | null>(documents[0] || null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const documentChangeRef = useRef<number>(0);

  // Définir la fonction addNewDocument avec les 3 paramètres attendus
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

  // Utiliser useAnnotationsHandler comme avant
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
    handleSelectDocument: (document: Document) => {
      setActiveDocument(document);
      setSelectedAnnotation(null);
    },
    addNewDocument, // Ajouter cette fonction à l'objet retourné
    ...handlers
  };
};
