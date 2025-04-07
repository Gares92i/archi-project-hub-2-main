import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Annotation } from "./types";
import { getStorageKeyForProject } from "@/lib/storageUtils";

export const useAnnotations = (initialDocuments: Document[], projectId: string) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeDocument, setActiveDocument] = useState<Document | null>(
    documents.length > 0 ? documents[0] : null
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedState = useRef<string>("");
  
  // Clé unique pour ce projet
  const storageKey = getStorageKeyForProject(projectId, "annotationsState");

  // Charger les documents depuis le localStorage
  useEffect(() => {
    // Chargement des données depuis localStorage
    const savedState = localStorage.getItem(storageKey);
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Filtrer les documents pour exclure ceux avec des URLs invalides
        const validDocuments = (parsedState.documents || []).filter(
          (doc: Document) => doc.url && doc.url !== '/placeholder.svg'
        );
        
        // Si nous avons des documents valides, utilisez-les
        if (validDocuments.length > 0) {
          console.log(`Loaded ${validDocuments.length} valid documents from localStorage`);
          setDocuments(validDocuments);
          
          // Trouver le document actif
          if (parsedState.activeDocumentId) {
            const activeDoc = validDocuments.find(
              (doc: Document) => doc.id === parsedState.activeDocumentId
            );
            if (activeDoc) {
              setActiveDocument(activeDoc);
            } else if (validDocuments.length > 0) {
              // Si le document actif n'existe pas, utilisez le premier document valide
              setActiveDocument(validDocuments[0]);
            }
          } else if (validDocuments.length > 0) {
            setActiveDocument(validDocuments[0]);
          }
        } else {
          // Si tous les documents sont invalides, utilisez les documents initiaux
          console.log("No valid documents found in localStorage, using initial documents");
          if (initialDocuments.length > 0) {
            setDocuments(initialDocuments);
            setActiveDocument(initialDocuments[0]);
          }
        }
        
        lastSavedState.current = JSON.stringify({
          documents: documents,
          activeDocumentId: activeDocument?.id
        });
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
      // Pas de données dans localStorage, utiliser les documents initiaux
      if (initialDocuments.length > 0) {
        console.log("No data in localStorage, using initial documents");
        setDocuments(initialDocuments);
        setActiveDocument(initialDocuments[0]);
      }
    }
  }, [storageKey, initialDocuments]);

  // Sauvegarder l'état dans le localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      // Préparation des données avec réduction de taille
      const storableDocuments = documents.map(doc => ({
        ...doc,
        // Réduire ou supprimer les grandes URLs
        url: doc.url?.startsWith('data:') ? 
          `data:${doc.url.split(';')[0].split(':')[1]};truncated` : 
          doc.url,
        // Réduire les annotations
        annotations: doc.annotations.map(ann => ({
          id: ann.id,
          x: ann.x,
          y: ann.y,
          comment: ann.comment,
          resolved: ann.resolved,
          createdAt: ann.createdAt,
          // Ne pas stocker les photos complètes, juste leur nombre
          photoCount: (ann.photos || []).length
          // Supprimer les photos pour réduire la taille
        }))
      }));
      
      // État à sauvegarder
      const stateToSave = {
        documents: storableDocuments,
        activeDocumentId: activeDocument?.id || null,
      };
      
      // Diviser en morceaux si nécessaire
      const stateJson = JSON.stringify(stateToSave);
      console.log(`Taille des données à sauvegarder: ${(stateJson.length / 1024).toFixed(2)} Ko`);
      
      if (stateJson.length > 4 * 1024 * 1024) { // Si > 4Mo
        console.warn("Données trop volumineuses pour localStorage, stockage simplifié");
        
        // Version ultra-simplifiée sans photos ni contenu d'URL
        const minimalState = {
          documents: documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            annotationCount: doc.annotations.length,
          })),
          activeDocumentId: activeDocument?.id || null,
        };
        
        localStorage.setItem(storageKey, JSON.stringify(minimalState));
      } else {
        // Essayer de sauvegarder normalement
        try {
          localStorage.setItem(storageKey, stateJson);
          lastSavedState.current = stateJson;
        } catch (storageError) {
          console.error("Erreur lors de la sauvegarde dans localStorage, tentative simplifiée", storageError);
          
          // En cas d'erreur, essayer une version sans photos
          const reducedState = {
            documents: documents.map(doc => ({
              id: doc.id,
              name: doc.name,
              type: doc.type,
              url: doc.url?.startsWith('data:') ? 
                `data:${doc.url.split(';')[0].split(':')[1]};truncated` : 
                doc.url,
              annotations: doc.annotations.map(ann => ({
                id: ann.id,
                x: ann.x,
                y: ann.y,
                comment: ann.comment,
                resolved: ann.resolved,
                createdAt: ann.createdAt,
                photoCount: (ann.photos || []).length
              }))
            })),
            activeDocumentId: activeDocument?.id || null,
          };
          
          try {
            // Vider d'abord pour libérer de l'espace
            localStorage.removeItem(storageKey);
            localStorage.setItem(storageKey, JSON.stringify(reducedState));
          } catch (finalError) {
            console.error("Échec final de la sauvegarde, impossible de stocker les données", finalError);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la préparation des données à sauvegarder:", error);
    }
  }, [documents, activeDocument, isInitialized, storageKey]);

  // Sélectionner un document
  const handleSelectDocument = useCallback(
    (document: Document) => {
      // Vérifier si le document est déjà sélectionné pour éviter les re-rendus inutiles
      if (activeDocument?.id === document.id) return;
      
      setActiveDocument(document);
      setSelectedAnnotation(null);
      
      // Sauvegarder l'ID du document actif
      const stateToSave = {
        documents,
        activeDocumentId: document.id
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      lastSavedState.current = JSON.stringify(stateToSave);
    },
    [activeDocument?.id, documents, setActiveDocument, setSelectedAnnotation, storageKey]
  );

  // Ajouter une annotation
  const handleAddAnnotation = useCallback(
    (position: { x: number; y: number }) => {
      if (!activeDocument) {
        console.error("Tentative d'ajout d'annotation sans document actif");
        return;
      }

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        x: position.x,
        y: position.y,
        position: { x: position.x, y: position.y }, // Ajouter cette propriété pour compatibilité
        comment: "",
        resolved: false,
        photos: [],
        createdAt: new Date().toISOString(),
      };

      console.log("Nouvelle annotation créée:", newAnnotation);
      console.log("Document actif:", activeDocument);

      // S'assurer que activeDocument.annotations est toujours un tableau
      const currentAnnotations = activeDocument.annotations || [];
      
      const updatedDocument = {
        ...activeDocument,
        annotations: [...currentAnnotations, newAnnotation],
      };

      const updatedDocuments = documents.map((doc) =>
        doc.id === activeDocument.id ? updatedDocument : doc
      );

      setDocuments(updatedDocuments);
      setActiveDocument(updatedDocument);
      setSelectedAnnotation(newAnnotation);
      setIsAnnotationDialogOpen(true);
    },
    [activeDocument, documents]
  );

  // Modifier le statut résolu d'une annotation
  const handleToggleResolved = useCallback(
      (id: string, resolvedState?: boolean) => {
        if (!activeDocument) return;
        
        // S'assurer que activeDocument.annotations existe
        const currentAnnotations = activeDocument.annotations || [];
  
        const updatedAnnotations = currentAnnotations.map((ann) =>
          ann.id === id
            ? { ...ann, resolved: resolvedState !== undefined ? resolvedState : !ann.resolved }
            : ann
        );
  
        const updatedDocument = {
          ...activeDocument,
          annotations: updatedAnnotations,
        };
  
        const updatedDocuments = documents.map((doc) =>
          doc.id === activeDocument.id ? updatedDocument : doc
        );
  
        setDocuments(updatedDocuments);
        setActiveDocument(updatedDocument);
  
        // Si l'annotation sélectionnée est celle qu'on vient de modifier, la mettre à jour
        if (selectedAnnotation?.id === id) {
          const updatedSelectedAnnotation = updatedAnnotations.find(
            (ann) => ann.id === id
          );
          setSelectedAnnotation(updatedSelectedAnnotation || null);
        }
      },
      [activeDocument, documents, selectedAnnotation]
    );

  // Mettre à jour le document actif
  const handleDocumentUpdate = useCallback(
    (url: string, filename?: string) => {
      if (!activeDocument) return;

      const type = url.startsWith("data:application/pdf") ? "pdf" : "img";
      
      const updatedDocument = {
        ...activeDocument,
        url,
        name: filename || activeDocument.name,
        type: type as "pdf" | "img",
      };

      const updatedDocuments = documents.map((doc) =>
        doc.id === activeDocument.id ? updatedDocument : doc
      );

      setDocuments(updatedDocuments);
      setActiveDocument(updatedDocument);
    },
    [activeDocument, documents]
  );

  // Gérer le clic sur une annotation
  const handleAnnotationClick = useCallback(
    (annotation: Annotation) => {
      console.log("Annotation cliquée:", annotation);
      setSelectedAnnotation(annotation);
      setIsAnnotationDialogOpen(true);
    },
    []
  );

  // Mettre en évidence une annotation sans ouvrir le dialogue
  const handleHighlightAnnotation = useCallback(
    (annotation: Annotation) => {
      setSelectedAnnotation(annotation);
    },
    []
  );

  // Fonction utilitaire pour optimiser la taille des images
  const optimizeImage = async (dataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Si l'image est déjà petite, la retourner telle quelle
        if (img.width <= maxWidth) {
          resolve(dataUrl);
          return;
        }
        
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
      img.src = dataUrl;
    });
  };

  // Ajouter une photo à une annotation
  const handleAddPhoto = useCallback(
    async (annotationId: string, photoUrl: string) => {
      if (!activeDocument) return;
      
      try {
        // Optimiser l'image si c'est une dataURL
        const optimizedPhotoUrl = photoUrl.startsWith('data:image') 
          ? await optimizeImage(photoUrl) 
          : photoUrl;

        const updatedAnnotations = (activeDocument.annotations || []).map((ann) =>
          ann.id === annotationId
            ? { ...ann, photos: [...(ann.photos || []), optimizedPhotoUrl] }
            : ann
        );

        const updatedDocument = {
          ...activeDocument,
          annotations: updatedAnnotations,
        };

        const updatedDocuments = documents.map((doc) =>
          doc.id === activeDocument.id ? updatedDocument : doc
        );

        setDocuments(updatedDocuments);
        setActiveDocument(updatedDocument);

        // Mettre à jour l'annotation sélectionnée
        if (selectedAnnotation?.id === annotationId) {
          const updatedSelectedAnnotation = updatedAnnotations.find(
            (ann) => ann.id === annotationId
          );
          setSelectedAnnotation(updatedSelectedAnnotation || null);
        }
        
        console.log("Photo ajoutée avec succès");
      } catch (error) {
        console.error("Erreur lors de l'ajout de la photo:", error);
      }
    },
    [activeDocument, documents, selectedAnnotation]
  );

  // Supprimer une photo d'une annotation
  const handleRemovePhoto = useCallback(
    (annotationId: string, photoIndex: number) => {
      if (!activeDocument) return;

      const updatedAnnotations = (activeDocument.annotations || []).map((ann) => {
        if (ann.id !== annotationId) return ann;
        
        const updatedPhotos = [...(ann.photos || [])];
        updatedPhotos.splice(photoIndex, 1);
        return { ...ann, photos: updatedPhotos };
      });

      const updatedDocument = {
        ...activeDocument,
        annotations: updatedAnnotations,
      };

      const updatedDocuments = documents.map((doc) =>
        doc.id === activeDocument.id ? updatedDocument : doc
      );

      setDocuments(updatedDocuments);
      setActiveDocument(updatedDocument);

      if (selectedAnnotation?.id === annotationId) {
        const updatedSelectedAnnotation = updatedAnnotations.find(
          (ann) => ann.id === annotationId
        );
        setSelectedAnnotation(updatedSelectedAnnotation || null);
      }
    },
    [activeDocument, documents, selectedAnnotation]
  );

  // Mettre à jour le commentaire d'une annotation
  const handleUpdateComment = useCallback(
    (annotationId: string, comment: string) => {
      if (!activeDocument) return;

      console.log("Mise à jour du commentaire:", annotationId, comment); // Log de débogage

      const updatedAnnotations = (activeDocument.annotations || []).map((ann) =>
        ann.id === annotationId ? { ...ann, comment } : ann
      );

      const updatedDocument = {
        ...activeDocument,
        annotations: updatedAnnotations,
      };

      const updatedDocuments = documents.map((doc) =>
        doc.id === activeDocument.id ? updatedDocument : doc
      );

      setDocuments(updatedDocuments);
      setActiveDocument(updatedDocument);

      // Mettre à jour l'annotation sélectionnée si c'est celle qu'on modifie
      if (selectedAnnotation?.id === annotationId) {
        const updatedSelectedAnnotation = updatedAnnotations.find(
          (ann) => ann.id === annotationId
        );
        setSelectedAnnotation(updatedSelectedAnnotation || null);
      }
    },
    [activeDocument, documents, selectedAnnotation]
  );

  // Ajouter un nouveau document
  const addNewDocument = useCallback(
    (url: string, name: string, type: "pdf" | "img") => {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name,
        type,
        url,
        annotations: []
      };

      console.log("useAnnotations: Ajout d'un nouveau document:", name);

      // Important: créez une nouvelle référence du tableau pour déclencher un re-rendu
      const newDocuments = [...documents, newDocument];
      
      // Mettre à jour l'état des documents avec la nouvelle référence
      setDocuments(newDocuments);
      
      // Sélectionner le nouveau document immédiatement
      setActiveDocument(newDocument);
      
      // Sauvegarder dans localStorage
      const stateToSave = {
        documents: newDocuments,
        activeDocumentId: newDocument.id
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      lastSavedState.current = JSON.stringify(stateToSave);
      
      return newDocument;
    },
    [documents, setDocuments, setActiveDocument, storageKey]
  );

  const resetProjectData = useCallback(() => {
    setDocuments(initialDocuments);
    setActiveDocument(initialDocuments.length > 0 ? initialDocuments[0] : null);
    setSelectedAnnotation(null);
    
    // Supprimer les données du localStorage pour ce projet
    localStorage.removeItem(storageKey);
    lastSavedState.current = "";
  }, [initialDocuments, storageKey]);

  // Ajoutez une fonction pour convertir une annotation en tâche
  const handleConvertToTask = useCallback(
    (annotation: Annotation) => {
      if (!annotation) return;
      
      // Créer une nouvelle tâche à partir de l'annotation
      const newTask = {
        id: `task-${Date.now()}`,
        title: `Annotation ${annotation.id.slice(-4)}`,
        name: `Annotation ${annotation.id.slice(-4)}`,
        description: annotation.comment || "Tâche créée depuis une annotation",
        status: "todo",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Une semaine plus tard
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedTo: [],
        completed: false,
        progress: 0,
        createdAt: new Date().toISOString(),
        projectId: projectId,
        // Lier l'annotation à la tâche
        annotationId: annotation.id,
        attachments: annotation.photos || []
      };
      
      try {
        // Ajouter à la liste globale des tâches
        const storedTasks = localStorage.getItem("project_tasks") || "[]";
        const tasks = JSON.parse(storedTasks);
        tasks.push(newTask);
        localStorage.setItem("project_tasks", JSON.stringify(tasks));
        
        // Ajouter également à la liste des tâches du projet spécifique
        const projectTasksKey = `project_${projectId}_tasks`;
        const storedProjectTasks = localStorage.getItem(projectTasksKey) || "[]";
        const projectTasks = JSON.parse(storedProjectTasks);
        projectTasks.push(newTask);
        localStorage.setItem(projectTasksKey, JSON.stringify(projectTasks));
        
        // Marquer l'annotation comme résolue
        handleToggleResolved(annotation.id, true);
        
        // Déclencher un événement pour indiquer qu'une tâche a été créée
        window.dispatchEvent(new CustomEvent('taskCreated', { detail: { taskId: newTask.id } }));
        
        return newTask.id;
      } catch (error) {
        console.error("Erreur lors de la conversion en tâche:", error);
        return null;
      }
    },
    [projectId, handleToggleResolved]
  );

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
    handleUpdateComment,
    handleConvertToTask, // Nouvelle fonction
    addNewDocument,
    setDocuments,
    resetProjectData,
  };
};
