import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Annotation } from "./types";
import { Document as DocumentType } from "./types";
import { useAnnotationsHandler } from "./hooks/useAnnotationsHandler";
import { ensureDocument } from "./types";

export const useAnnotations = (initialDocuments: DocumentType[]) => {
  const [documents, setDocuments] = useState<DocumentType[]>(initialDocuments);
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(
    initialDocuments.length > 0 ? initialDocuments[0] : null
  );
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<Annotation | null>(null);
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);

  const handleSelectDocument = useCallback((document: DocumentType) => {
    setActiveDocument(document);
    setSelectedAnnotation(null);
  }, []);

  const addNewDocument = useCallback(
    (url: string, name: string, type: "pdf" | "img") => {
      const newDocument: DocumentType = {
        id: Date.now().toString(),
        name,
        type,
        url,
        annotations: [],
      };

      setDocuments((prev) => [...prev, newDocument]);
      setActiveDocument(newDocument);
    },
    []
  );

  const {
    handleAddAnnotation,
    handleToggleResolved,
    handleDocumentUpdate,
    handleAnnotationClick,
    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
  } = useAnnotationsHandler({
    documents,
    activeDocument,
    setDocuments,
    setActiveDocument,
    setSelectedAnnotation,
    setIsAnnotationDialogOpen,
  });

  const saveState = useCallback(() => {
    if (!activeDocument) return;

    try {
      localStorage.setItem(
        `document_${activeDocument.id}`,
        JSON.stringify(activeDocument)
      );

      localStorage.setItem("project_documents", JSON.stringify(documents));

      console.log("État sauvegardé");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  }, [activeDocument, documents]);

  const handleConvertToTask = useCallback((annotationId: string) => {
    console.log("Conversion de l'annotation en tâche:", annotationId);
    toast.info("Fonctionnalité de conversion en tâche");
  }, []);

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
    handleConvertToTask,
    saveState,
  };
};
