import { useState, useEffect, useRef } from 'react';
import { Annotation, Document } from './types';
import { toast } from 'sonner';

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
      projectId: "1" // Add default projectId
    },
    {
      id: "2",
      position: { x: 700, y: 350 },
      comment: "Merci de me faire une validation sur ce point",
      author: "Vous",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: [],
      projectId: "1" // Add default projectId
    },
    {
      id: "3",
      position: { x: 500, y: 650 },
      comment: "Vérifier les dimensions ici",
      author: "Vous",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: [],
      projectId: "1" // Add default projectId
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

  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
    // Incrémenter le compteur pour identifier les changements de document
    documentChangeRef.current += 1;
  };

  const handleAddAnnotation = (position: { x: number; y: number }) => {
    if (activeDocument) {
      // Find the next available annotation number
      const allAnnotations = documents.flatMap(doc => doc.annotations);
      const maxId = allAnnotations.length > 0 
        ? Math.max(...allAnnotations.map(a => parseInt(a.id)))
        : 0;
      
      const newAnnotation: Annotation = {
        id: (maxId + 1).toString(),
        position,
        comment: "Nouvelle annotation",
        author: "Utilisateur",
        date: new Date().toLocaleDateString(),
        isResolved: false,
        photos: [],
        projectId: "1" // Add default projectId for new annotations
      };
      
      // Add the annotation to the active document
      const updatedDocuments = documents.map(doc => 
        doc.id === activeDocument.id 
          ? { ...doc, annotations: [...doc.annotations, newAnnotation] } 
          : doc
      );
      
      setDocuments(updatedDocuments);
      
      // Update active document reference
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      setActiveDocument(updatedActiveDoc);
      
      // Select the new annotation
      setSelectedAnnotation(newAnnotation);
      setIsAnnotationDialogOpen(true);
    }
  };

  const handleToggleResolved = (id: string) => {
    if (activeDocument) {
      const updatedDocuments = documents.map(doc => 
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id 
                  ? { ...annotation, isResolved: !annotation.isResolved } 
                  : annotation
              )
            }
          : doc
      );
      
      setDocuments(updatedDocuments);
      
      // Update active document reference
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      setActiveDocument(updatedActiveDoc);
      
      // Update selected annotation if it was the one toggled
      if (selectedAnnotation && selectedAnnotation.id === id) {
        const updatedAnnotation = updatedActiveDoc?.annotations.find(a => a.id === id) || null;
        setSelectedAnnotation(updatedAnnotation);
      }
      
      toast.success(`Annotation ${id} marquée comme ${updatedActiveDoc?.annotations.find(a => a.id === id)?.isResolved ? 'résolue' : 'non résolue'}`);
    }
  };
  
  const handleAddPhoto = (id: string, photoUrl: string) => {
    if (activeDocument) {
      const updatedDocuments = documents.map(doc => 
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id 
                  ? { ...annotation, photos: [...annotation.photos, photoUrl] } 
                  : annotation
              )
            }
          : doc
      );
      
      setDocuments(updatedDocuments);
      
      // Update active document reference
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      setActiveDocument(updatedActiveDoc);
      
      // Update selected annotation if it was modified
      if (selectedAnnotation && selectedAnnotation.id === id) {
        const updatedAnnotation = updatedActiveDoc?.annotations.find(a => a.id === id) || null;
        setSelectedAnnotation(updatedAnnotation);
      }
    }
  };
  
  const handleRemovePhoto = (id: string, photoIndex: number) => {
    if (activeDocument) {
      const updatedDocuments = documents.map(doc => 
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id 
                  ? { 
                      ...annotation, 
                      photos: annotation.photos.filter((_, idx) => idx !== photoIndex) 
                    } 
                  : annotation
              )
            }
          : doc
      );
      
      setDocuments(updatedDocuments);
      
      // Update active document reference
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      setActiveDocument(updatedActiveDoc);
      
      // Update selected annotation if it was modified
      if (selectedAnnotation && selectedAnnotation.id === id) {
        const updatedAnnotation = updatedActiveDoc?.annotations.find(a => a.id === id) || null;
        setSelectedAnnotation(updatedAnnotation);
      }
    }
  };
  
  const handleUpdateComment = (id: string, comment: string) => {
    if (activeDocument) {
      const updatedDocuments = documents.map(doc => 
        doc.id === activeDocument.id
          ? {
              ...doc,
              annotations: doc.annotations.map(annotation =>
                annotation.id === id 
                  ? { ...annotation, comment: `${annotation.comment}\n\n${comment}` } 
                  : annotation
              )
            }
          : doc
      );
      
      setDocuments(updatedDocuments);
      
      // Update active document reference
      const updatedActiveDoc = updatedDocuments.find(doc => doc.id === activeDocument.id) || null;
      setActiveDocument(updatedActiveDoc);
      
      // Update selected annotation if it was modified
      if (selectedAnnotation && selectedAnnotation.id === id) {
        const updatedAnnotation = updatedActiveDoc?.annotations.find(a => a.id === id) || null;
        setSelectedAnnotation(updatedAnnotation);
      }
    }
  };

  const handleDocumentUpdate = (url: string) => {
    // Déterminer le type de document (PDF ou image)
    const type = url.includes('data:application/pdf') ? 'pdf' : 'img';
    
    // Créer un nouveau document
    const newDocumentId = Date.now().toString();
    const newDocument: Document = {
      id: newDocumentId,
      name: `Document ${newDocumentId.substring(8)}`,
      type: type,
      url: url,
      annotations: []
    };
    
    console.log("Creating new document:", { id: newDocument.id, name: newDocument.name, type: newDocument.type });
    
    // Ajouter le nouveau document à la liste
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    
    // Activer le nouveau document
    setActiveDocument(newDocument);
    setSelectedAnnotation(null);
  };

  const addNewDocument = (url: string, name: string, type: "pdf" | "img") => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name,
      type,
      url,
      annotations: []
    };
    
    setDocuments([...documents, newDocument]);
    setActiveDocument(newDocument);
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsAnnotationDialogOpen(true);
  };

  const handleHighlightAnnotation = (annotationId: string) => {
    if (activeDocument) {
      const annotation = activeDocument.annotations.find(a => a.id === annotationId);
      if (annotation) {
        setSelectedAnnotation(annotation);
      }
    }
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
    handleUpdateComment,
    addNewDocument
  };
};
