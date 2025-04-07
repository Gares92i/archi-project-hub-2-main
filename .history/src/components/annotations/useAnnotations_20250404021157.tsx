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
    if (isInitialized) return;

    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setDocuments(parsedState.documents || initialDocuments);
        
        // Si un document actif est sauvegardé, le restaurer
        if (parsedState.activeDocumentId) {
          const savedActiveDoc = (parsedState.documents || []).find(
            (doc: Document) => doc.id === parsedState.activeDocumentId
          );
          if (savedActiveDoc) {
            setActiveDocument(savedActiveDoc);
          }
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors du chargement de l'état:", error);
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, [initialDocuments, isInitialized, projectId, storageKey]);

  // Sauvegarder l'état dans le localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    // Préparer l'état à sauvegarder
    const stateToSave = {
      documents,
      activeDocumentId: activeDocument?.id || null,
    };
    
    // Convertir en JSON
    const stateJson = JSON.stringify(stateToSave);
    
    // Vérifier si l'état a changé avant de sauvegarder
    if (stateJson !== lastSavedState.current) {
      localStorage.setItem(storageKey, stateJson);
      lastSavedState.current = stateJson;
    }
  }, [documents, activeDocument, isInitialized, storageKey]);

  // Sélectionner un document
  const handleSelectDocument = useCallback(
    (document: Document) => {
      setActiveDocument(document);
      setSelectedAnnotation(null);
    },
    []
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
        url,
        type: type as "pdf" | "img",
        annotations: [],
      };

      const newDocuments = [...documents, newDocument];
      setDocuments(newDocuments);
      setActiveDocument(newDocument);
    },
    [documents]
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
        description: annotation.comment || "Tâche créée depuis une annotation",
        status: "todo",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Une semaine plus tard
        assignedTo: [],
        createdAt: new Date().toISOString(),
        projectId: projectId,
        // Lier l'annotation à la tâche
        annotationId: annotation.id,
        // Ajouter les photos de l'annotation à la tâche
        attachments: annotation.photos || []
      };
      
      // Sauvegarder la tâche dans le localStorage
      try {
        // Récupérer les tâches existantes
        const tasksString = localStorage.getItem("project_tasks") || "[]";
        const tasks = JSON.parse(tasksString);
        
        // Ajouter la nouvelle tâche
        tasks.push(newTask);
        
        // Sauvegarder les tâches
        localStorage.setItem("project_tasks", JSON.stringify(tasks));

        // Marquer l'annotation comme résolue
        handleToggleResolved(annotation.id, true);
        
        console.log("Tâche créée avec succès:", newTask);
        
        // Retourner la nouvelle tâche pour permettre une redirection ou autre action
        return newTask;
      } catch (error) {
        console.error("Erreur lors de la création de la tâche:", error);
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
