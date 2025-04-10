import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Annotation } from "./types";
import { toast } from "sonner";

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
          
          dataLoaded.current = true;
        } else if (initialDocuments.length > 0) {
          console.log("Utilisation des documents initiaux:", initialDocuments.length);
          setDocuments(initialDocuments);
          setActiveDocument(initialDocuments[0]);
          dataLoaded.current = true;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadSavedData();
  }, [projectId, initialDocuments]);

  // Sauvegarder les documents dans localStorage à chaque modification avec gestion des erreurs de quota
 // Modifier dans useAnnotations.tsx - Amélioration de la sauvegarde des documents
const saveProjectData = useCallback((data: Document[]) => {
  try {
    // Créer des miniatures pour les documents avant sauvegarde
    const processedData = data.map(doc => {
      if (doc.type === "img" && doc.url.length > 50000) {
        // Créer une version miniature de l'image pour le localStorage
        const thumbnailUrl = createThumbnail(doc.url, 300); // 300px de largeur max
        
        return {
          ...doc,
          // Stocker l'URL originale dans une propriété séparée temporairement
          originalUrl: doc.url,
          // Utiliser la miniature comme URL principale
          url: thumbnailUrl
        };
      }
      return doc;
    });
    
    localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(processedData));
    console.log("Documents sauvegardés avec succès");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
    
    // Tentative de sauvegarde allégée si échec
    try {
      const lightData = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        // Inclure uniquement les métadonnées des annotations, sans les images
        annotations: doc.annotations?.map(ann => ({
          id: ann.id,
          x: ann.x,
          y: ann.y,
          comment: ann.comment,
          resolved: ann.resolved,
          createdAt: ann.createdAt,
          lot: ann.lot,
          location: ann.location
        }))
      }));
      
      localStorage.setItem(`project-annotations-${projectId}-metadata`, JSON.stringify(lightData));
      toast.warning("Stockage limité: les images des documents ne seront pas sauvegardées", {
        duration: 5000
      });
    } catch (innerError) {
      console.error("Échec total de la sauvegarde:", innerError);
    }
  }
}, [projectId]);

// Fonction utilitaire pour créer des miniatures d'images
function createThumbnail(dataUrl: string, maxWidth: number): string {
  try {
    // Création d'un canvas temporaire pour la miniature
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Dimensions de base
    canvas.width = maxWidth;
    canvas.height = maxWidth;
    
    // Dessiner l'image sur le canvas à taille réduite
    img.src = dataUrl;
    
    // Calculer les proportions
    const ratio = maxWidth / Math.max(img.width, img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    
    ctx.drawImage(img, 0, 0, width, height);
    
    // Générer une miniature en JPEG avec qualité réduite
    return canvas.toDataURL('image/jpeg', 0.5);
  } catch (e) {
    console.error("Erreur lors de la création de la miniature:", e);
    return dataUrl;
  }
}

  // Nettoyer le stockage pour libérer de l'espace
  const cleanupStorage = useCallback(() => {
    try {
      // Identifier les clés de stockage qui ne sont pas le projet actuel
      const keysToCheck = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project-annotations-') && key !== `project-annotations-${projectId}`) {
          keysToCheck.push(key);
        }
      }
      
      // Si on a plus de 3 autres projets, supprimer les plus anciens
      if (keysToCheck.length > 3) {
        // Trier par date de dernier accès si disponible, sinon supprimer les premiers trouvés
        keysToCheck.sort((a, b) => {
          const accessA = localStorage.getItem(`${a}-lastAccess`) || '0';
          const accessB = localStorage.getItem(`${b}-lastAccess`) || '0';
          return parseInt(accessA) - parseInt(accessB);
        });
        
        // Supprimer les plus anciens pour ne garder que 3 projets max
        for (let i = 0; i < keysToCheck.length - 3; i++) {
          localStorage.removeItem(keysToCheck[i]);
          localStorage.removeItem(`${keysToCheck[i]}-lastAccess`);
          console.log(`Nettoyage du stockage: projet ${keysToCheck[i]} supprimé`);
        }
      }
      
      // Marquer ce projet comme dernièrement accédé
      localStorage.setItem(`project-annotations-${projectId}-lastAccess`, Date.now().toString());
      
    } catch (error) {
      console.error("Erreur lors du nettoyage du stockage:", error);
    }
  }, [projectId]);

  // Appeler le nettoyage au chargement
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
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
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
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      documentId: activeDocument.id,
      x: position.x,
      y: position.y,
      position: position, // Garder la compatibilité avec les deux formes
      comment: "",
      resolved: false,
      isResolved: false, // Pour compatibilité
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

  // Toggle resolved status
  const handleToggleResolved = useCallback((id: string, resolved?: boolean) => {
    if (!activeDocument) return;

    const annotation = activeDocument.annotations?.find(a => a.id === id);
    if (!annotation) return;

    const isCurrentlyResolved = annotation.resolved || annotation.isResolved;
    const newResolvedState = resolved !== undefined ? resolved : !isCurrentlyResolved;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        return {
          ...a,
          resolved: newResolvedState,
          isResolved: newResolvedState, // Pour compatibilité
          resolvedDate: newResolvedState ? new Date().toISOString() : undefined
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
      setSelectedAnnotation({
        ...selectedAnnotation,
        resolved: newResolvedState,
        isResolved: newResolvedState, // Pour compatibilité
        resolvedDate: newResolvedState ? new Date().toISOString() : undefined
      });
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
      const updatedSelectedAnnotation = {
        ...selectedAnnotation,
        ...data
      };
      
      // Si x ou y ont été mis à jour, assurer la cohérence
      if (data.x !== undefined || data.y !== undefined) {
        const updatedX = data.x !== undefined ? 
          (data.x >= 0 && data.x <= 100 ? data.x : selectedAnnotation.x) : selectedAnnotation.x;
          
        const updatedY = data.y !== undefined ? 
          (data.y >= 0 && data.y <= 100 ? data.y : selectedAnnotation.y) : selectedAnnotation.y;
          
        updatedSelectedAnnotation.x = updatedX;
        updatedSelectedAnnotation.y = updatedY;
        updatedSelectedAnnotation.position = { x: updatedX, y: updatedY };
      }
      
      setSelectedAnnotation(updatedSelectedAnnotation);
      console.log("Annotation sélectionnée mise à jour:", updatedSelectedAnnotation);
    }
  }, [activeDocument, documents, selectedAnnotation, updateAndSaveDocuments]);

  // Ajouter une photo à une annotation
  const handleAddPhoto = useCallback((id: string, photoUrl: string) => {
    if (!activeDocument) return;

    const updatedAnnotations = activeDocument.annotations?.map(a => {
      if (a.id === id) {
        const photos = a.photos || [];
        return { ...a, photos: [...photos, photoUrl] };
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
      const photos = selectedAnnotation.photos || [];
      setSelectedAnnotation({ ...selectedAnnotation, photos: [...photos, photoUrl] });
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

    // Mettre à jour l'annotation sélectionnée si c'est celle-ci
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

  // Exporter les annotations au format JSON
  const exportAnnotations = useCallback(() => {
    try {
      const data = JSON.stringify(documents, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotations-${projectId}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success("Annotations exportées avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'exportation des annotations:', error);
      toast.error("Erreur lors de l'exportation des annotations");
    }
  }, [documents, projectId]);

  return {
    documents,
    setDocuments: updateAndSaveDocuments,
    activeDocument,
    selectedAnnotation,
    setSelectedAnnotation,
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
    saveProjectData,
    exportAnnotations
  };
};

export default useAnnotations;
