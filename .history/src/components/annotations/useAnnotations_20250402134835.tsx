import { useState, useEffect, useRef } from 'react';
import { Annotation, Document } from './types';
import { useAnnotationsHandler } from './hooks/useAnnotationsHandler';

export const useAnnotations = (initialDocuments: Document[]) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [activeDocument, setActiveDocument] = useState<Document | null>(documents[0] || null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const documentChangeRef = useRef<number>(0);

  // Initial annotations are assigned to the first document
  const initialAnnotations: Annotation[] = [
    {
      id: "1",
      position: { x: 350, y: 300 },
      comment: "Le plus haut possible sous la poutre. La hauteur définitive dépendra plutôt du chiffrage de ces baies vitrées mais nous allons les prévoir le plus haut possible.",
      author: "Jude RAVI",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: ["/placeholder.svg"],
      projectId: "1"
    },
    {
      id: "2",
      position: { x: 700, y: 350 },
      comment: "Merci de me faire une validation sur ce point",
      author: "Vous",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: [],
      projectId: "1"
    },
    {
      id: "3",
      position: { x: 500, y: 650 },
      comment: "Vérifier les dimensions ici",
      author: "Vous",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: [],
      projectId: "1"
    }
  ];

  // Assign initial annotations to the first document
  useEffect(() => {
    if (documents[0] && documents[0].annotations.length === 0) {
      const updatedDocuments = [...documents];
      updatedDocuments[0].annotations = initialAnnotations;
      setDocuments(updatedDocuments);
    }
  }, []);

  // Utilisation de notre handler personnalisé
  const {
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment
  } = useAnnotationsHandler({
    documents,
    activeDocument,
    setDocuments,
    setActiveDocument,
    setSelectedAnnotation,
    setIsAnnotationDialogOpen
  });

  // Handler pour sélectionner un document
  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
    // Incrémenter le compteur pour identifier les changements de document
    documentChangeRef.current += 1;
  };

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
    handleUpdateComment
  };
};
