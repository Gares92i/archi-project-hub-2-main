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
      // Compresser les données pour réduire la taille
      const compressedData = compressData(data);
      localStorage.setItem(`project-annotations-${projectId}`, compressedData);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
      
      // En cas d'erreur de quota, supprimer des données obsolètes
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Option 1: Nettoyer les données actuelles (supprimer les photos)
          const cleanedData = data.map(doc => ({
            ...doc,
            annotations: doc.annotations?.map(ann => ({
              ...ann,
              photos: [] // Supprimer les photos qui prennent beaucoup d'espace
            }))
          }));
          
          const compressedData = compressData(cleanedData);
          localStorage.setItem(`project-annotations-${projectId}`, compressedData);
          
          toast.warning("Espace de stockage limité: les photos ont été supprimées", {
            description: "Exportez régulièrement vos annotations pour éviter les pertes de données"
          });
        } catch (innerError) {
          // Si même ça ne fonctionne pas, avertir l'utilisateur
          toast.error("Impossible de sauvegarder: stockage plein", {
            description: "Veuillez exporter vos données et vider le stockage"
          });
        }
      }
    }
  }, [projectId]);

  // Fonction pour compresser les données avant stockage
  const compressData = (data: Document[]): string => {
    // Version minimaliste - stringify sans les photos volumineuses
    const minimalData = data.map(doc => ({
      ...doc,
      annotations: doc.annotations?.map(ann => ({
        ...ann,
        // Limiter les photos à des miniatures ou à 1 seule
        photos: ann.photos?.length ? [ann.photos[0]] : []
      }))
    }));
    
    return JSON.stringify(minimalData);
  };

  // Ajoutez également une fonction pour nettoyer périodiquement le stockage
  const cleanupStorage = useCallback(() => {
    try {
      // Parcourir tous les projets
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project-annotations-') && key !== `project-annotations-${projectId}`) {
          // Supprimer les anciens projets
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage du stockage:", error);
    }
  }, [projectId]);

  // Appelez cette fonction au chargement
  useEffect(() => {
    cleanupStorage();
  }, [cleanupStorage]);

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

    console.log(`Mise à jour de l'annotation ${id} avec les données:`, data);

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        // Si on met à jour les coordonnées x/y, s'assurer qu'elles sont en pourcentage (entre 0 et 100)
        const updatedX = data.x !== undefined ? 
          (data.x >= 0 && data.x <= 100 ? data.x : a.x) : a.x;
        
        const updatedY = data.y !== undefined ? 
          (data.y >= 0 && data.y <= 100 ? data.y : a.y) : a.y;
        
        // S'assurer que position est également mis à jour si présent
        const updatedPosition = data.x !== undefined || data.y !== undefined ? 
          { x: updatedX, y: updatedY } : a.position;

        return { 
          ...a, 
          ...data,
          x: updatedX,
          y: updatedY,
          position: updatedPosition
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

    // Conserver l'id dans le localStorage
    updateAndSaveDocuments(updatedDocuments);
    setActiveDocument(updatedDocument);
    
    // Update the selected annotation if it's the one being edited
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation({ ...selectedAnnotation, ...data });
      console.log("Annotation sélectionnée mise à jour:", { ...selectedAnnotation, ...data });
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
