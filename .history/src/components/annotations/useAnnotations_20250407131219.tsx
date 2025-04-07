import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Annotation } from "./types";

export const useAnnotations = (initialDocuments: Document[] = [], projectId: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  // Utiliser useRef pour suivre si les données ont déjà été chargées
  const dataLoaded = useRef(false);

  // Charger les données du localStorage au montage du composant uniquement
  useEffect(() => {
    // Éviter de recharger les données si elles ont déjà été chargées
    if (dataLoaded.current) return;

    const loadSavedData = () => {
      try {
        const storageKey = `project-annotations-${projectId}`;
        const savedDocuments = localStorage.getItem(storageKey);
        
        if (savedDocuments) {
          const parsedDocuments = JSON.parse(savedDocuments);
          console.log("Documents chargés depuis localStorage:", parsedDocuments.length);
          setDocuments(parsedDocuments);

          // Activer le premier document s'il y en a
          if (parsedDocuments.length > 0) {
            setActiveDocument(parsedDocuments[0]);
          }
        } else if (initialDocuments.length > 0) {
          // Utiliser les documents initiaux si rien n'est sauvegardé
          setDocuments(initialDocuments);
          setActiveDocument(initialDocuments[0]);
        }

        // Marquer les données comme chargées
        dataLoaded.current = true;
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        if (initialDocuments.length > 0) {
          setDocuments(initialDocuments);
          setActiveDocument(initialDocuments[0]);
        }
        dataLoaded.current = true;
      }
    };

    loadSavedData();
  }, [projectId]); // Enlever initialDocuments des dépendances

  // Sauvegarder les documents dans localStorage à chaque modification
  const saveProjectData = useCallback((data: Document[]) => {
    try {
      const storageKey = `project-annotations-${projectId}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log("Données sauvegardées dans localStorage:", data.length, "documents");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
    }
  }, [projectId]);

  // Mettre à jour les documents et sauvegarder automatiquement
  const updateAndSaveDocuments = useCallback((newDocuments: Document[]) => {
    setDocuments(newDocuments);
    saveProjectData(newDocuments);
  }, [saveProjectData]);

  // Réinitialiser les données du projet
  const resetProjectData = useCallback(() => {
    setDocuments([]);
    setActiveDocument(null);
    setSelectedAnnotation(null);
    setIsAnnotationDialogOpen(false);
    localStorage.removeItem(`project-annotations-${projectId}`);

    // Réinitialiser le flag pour permettre un nouveau chargement
    dataLoaded.current = false;
  }, [projectId]);

  // Sélectionner un document
  const handleSelectDocument = useCallback((document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  // Ajouter un nouveau document
  const addNewDocument = useCallback((url: string, name: string, type: "pdf" | "img") => {
    const newDocument: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || `Document ${documents.length + 1}`,
      url,
      type,
      annotations: []
    };

    const updatedDocuments = [...documents, newDocument];
    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(newDocument);

    return newDocument;
  }, [documents, updateAndSaveDocuments]);

  // Ajouter une annotation
  const handleAddAnnotation = useCallback((position: { x: number; y: number }) => {
    if (!activeDocument) return;

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      documentId: activeDocument.id,
      x: position.x,
      y: position.y,
      comment: "",
      resolved: false,
      createdAt: new Date().toISOString(),
      photos: []
    };

    const updatedAnnotations = [
      ...(activeDocument.annotations || []),
      newAnnotation
    ];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    setSelectedAnnotation(newAnnotation);
    setIsAnnotationDialogOpen(true);
  }, [activeDocument, documents, updateAndSaveDocuments]);

  // Autres fonctions d'annotation (toggle résolu, mise à jour commentaire, etc.)
  const handleToggleResolved = useCallback((id: string, resolved?: boolean) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        const newResolved = resolved !== undefined ? resolved : !a.resolved;
        return {
          ...a, 
          resolved: newResolved,
          isResolved: newResolved, // Pour compatibilité
          resolvedDate: newResolved ? new Date().toISOString() : undefined
        };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      const updatedSelectedAnnotation = updatedAnnotations.find(a => a.id === id);
      if (updatedSelectedAnnotation) {
        setSelectedAnnotation(updatedSelectedAnnotation);
      }
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Mettre à jour le commentaire d'une annotation
  const handleUpdateComment = useCallback((id: string, comment: string) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return { ...a, comment };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({ ...selectedAnnotation, comment });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Fonction pour mettre à jour une annotation avec de nouvelles données
  const handleUpdateAnnotation = useCallback((id: string, data: Partial<Annotation>) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return { ...a, ...data };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({ ...selectedAnnotation, ...data });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Ajouter une photo à une annotation
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return {
          ...a,
          photos: [...(a.photos || []), photoUrl]
        };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({
        ...selectedAnnotation,
        photos: [...(selectedAnnotation.photos || []), photoUrl]
      });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Supprimer une photo d'une annotation
  const handleRemovePhoto = useCallback((id: string, photoIndex: number) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id && a.photos) {
        const updatedPhotos = [...a.photos];
        updatedPhotos.splice(photoIndex, 1);
        return { ...a, photos: updatedPhotos };
      }
      return a;
    }) || [];

    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Mettre à jour l'annotation sélectionnée
    if (selectedAnnotation?.id === id && selectedAnnotation.photos) {
      const updatedPhotos = [...selectedAnnotation.photos];
      updatedPhotos.splice(photoIndex, 1);
      setSelectedAnnotation({ ...selectedAnnotation, photos: updatedPhotos });
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Cliquer sur une annotation dans la liste
  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  }, []);

  // Mettre en évidence une annotation sur le document
  const handleHighlightAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    // Logique pour faire défiler ou mettre en évidence l'annotation sur le document
  }, []);

  // Mettre à jour un document (utilisé quand on change la vue du document)
  const handleDocumentUpdate = useCallback((dataUrl: string) => {
    if (!activeDocument) return;

    const updatedDocument = {
      ...activeDocument,
      url: dataUrl
    };

    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );

    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
  }, [activeDocument, documents, updateAndSaveDocuments]);

  return {
    documents,
    setDocuments: updateAndSaveDocuments,
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
    handleUpdateAnnotation,
    addNewDocument,
    resetProjectData,
    saveProjectData
  };
};
