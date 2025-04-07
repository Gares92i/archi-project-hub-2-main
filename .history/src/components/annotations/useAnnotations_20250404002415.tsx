import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Annotation } from "./types";

export const useAnnotations = (initialDocuments: Document[]) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [activeDocument, setActiveDocument] = useState<Document | null>(
    documents.length > 0 ? documents[0] : null
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(
    null
  );
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSavedState = useRef<string>("");

  // Charger les documents depuis le localStorage
  useEffect(() => {
    // Si déjà initialisé, ne pas recharger
    if (isInitialized) return;
    
    const savedState = localStorage.getItem("annotationsState");
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
  }, [initialDocuments, isInitialized]);

  // Sauvegarder l'état dans le localStorage
  const saveAnnotationsState = useCallback(() => {
    const stateToSave = {
      documents,
      activeDocumentId: activeDocument?.id || null,
    };
    localStorage.setItem("annotationsState", JSON.stringify(stateToSave));
  }, [documents, activeDocument]);

  // Sauvegarder l'état quand les documents ou le document actif changent
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
      localStorage.setItem("annotationsState", stateJson);
      lastSavedState.current = stateJson;
    }
  }, [documents, activeDocument, isInitialized]);

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
      if (!activeDocument) return;

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        x: position.x,
        y: position.y,
        comment: "", // Initialisation avec une chaîne vide
        resolved: false, // Utilisation de "resolved" et non "isResolved"
        photos: [], // Initialisation avec un tableau vide
        createdAt: new Date().toISOString(),
      };

      // S'assurer que activeDocument.annotations existe
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
    (id: string) => {
      if (!activeDocument) return;
      
      // S'assurer que activeDocument.annotations existe
      const currentAnnotations = activeDocument.annotations || [];

      const updatedAnnotations = currentAnnotations.map((ann) =>
        ann.id === id ? { ...ann, resolved: !ann.resolved } : ann
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

  // Ajouter une photo à une annotation
  const handleAddPhoto = useCallback(
    (annotationId: string, photoUrl: string) => {
      if (!activeDocument) return;

      const updatedAnnotations = (activeDocument.annotations || []).map((ann) =>
        ann.id === annotationId
          ? { ...ann, photos: [...(ann.photos || []), photoUrl] }
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
    addNewDocument,
    setDocuments, // Exporter setDocuments
    saveAnnotationsState, // Exporter saveAnnotationsState pour permettre des sauvegardes explicites
  };
};
