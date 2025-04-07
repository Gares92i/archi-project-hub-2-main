import React, { useState, useEffect, useRef, useCallback } from "react";
import { DocumentsSidebar } from "./DocumentsSidebar";
import { AnnotationsSidebar } from "./AnnotationsSidebar";
import { MainContent } from "./MainContent";
import { AnnotationDialog } from "./AnnotationDialog";
import { ConvertToTaskDialog } from "./ConvertToTaskDialog";
import { toast } from "sonner";
import { useAnnotations } from "./useAnnotations";
import { Document, Annotation } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary";

export const PlanViewerPage = () => {
  // Remplacez le tableau initialDocuments par un tableau vide pour éviter les erreurs de document sans URL valide
  const initialDocuments: Document[] = [];

  const isMobile = useIsMobile();
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [isConvertToTaskOpen, setIsConvertToTaskOpen] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();

  // Ajoutez un état pour suivre si c'est le premier chargement
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Use the custom hook to manage annotations state and logic
  const {
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
    setDocuments, // Cette propriété sera disponible après la mise à jour du hook
    // Cette propriété aussi
    resetProjectData, // Récupérez la nouvelle fonction
  } = useAnnotations(initialDocuments, projectId || "default");

  // Debug: Log documents changes
  const prevDocLength = useRef(documents.length);
  useEffect(() => {
    if (prevDocLength.current !== documents.length) {
      console.log("Documents mis à jour:", documents.length);
      prevDocLength.current = documents.length;
    }
  }, [documents]);

  // Ajoutez ce useEffect pour vérifier les mises à jour de activeDocument
  useEffect(() => {
    let timeoutId: number;

    if (activeDocument) {
      // Utiliser setTimeout pour éviter les logs répétitifs
      timeoutId = window.setTimeout(() => {
        if (!activeDocument.url || activeDocument.url === '/placeholder.svg') {
          console.warn("Document sans URL valide:", activeDocument.id);
        }
      }, 500);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeDocument]);

  // Ajoutez un useEffect pour marquer la fin du premier chargement
  useEffect(() => {
    if (documents.length > 0 || activeDocument) {
      setIsFirstLoad(false);
    }
    
    // Si après un délai il n'y a toujours pas de documents, désactiver l'état de premier chargement
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [documents, activeDocument]);

  const handleConvertToTask = (annotation?: Annotation) => {
      if (annotation || selectedAnnotation) {
        setIsConvertToTaskOpen(true);
      } else {
        toast.error("Veuillez sélectionner une annotation à convertir en tâche");
      }
    };

  const handleTaskCreated = () => {
    setIsConvertToTaskOpen(false);
    if (selectedAnnotation) {
      handleToggleResolved(selectedAnnotation.id);
      toast.success(
        "L'annotation a été convertie en tâche et marquée comme résolue"
      );
    }
  };

  // Correction de la fonction handleAddNewDocument

  const handleAddNewDocument = useCallback((url: string, filename: string) => {
    console.log("handleAddNewDocument appelé avec:", filename);
    if (!url) {
      console.error("URL vide fournie à handleAddNewDocument");
      toast.error("Impossible d'ajouter le document : URL invalide");
      return;
    }
    
    const type = url.startsWith("data:application/pdf") ? "pdf" : "img";
  
    try {
      // Vérifier que addNewDocument est bien défini
      if (!addNewDocument) {
        console.error("La fonction addNewDocument n'est pas disponible");
        toast.error("Impossible d'ajouter le document : erreur interne");
        return;
      }
  
      addNewDocument(url, filename, type);
      
      const newDoc = documents.find(doc => doc.url === url && doc.filename === filename);
      if (newDoc?.id) {
        console.log("Nouveau document ajouté:", filename, newDoc.id);
        toast.success(`Document "${filename}" ajouté avec succès`);
      } else {
        console.error("Le document ajouté n'a pas d'ID valide");
        toast.error("Erreur lors de l'ajout du document");
      }
    } catch (error) {
      console.error("Erreur dans handleAddNewDocument:", error);
      toast.error("Erreur lors de l'ajout du document");
    }
  }, [addNewDocument]);

  const handleAddAnnotationCallback = useCallback(
    (position) => handleAddAnnotation(position),
    [handleAddAnnotation]
  );

  // Modifiez également la fonction handleDocumentUpdateCallback pour passer le nom du fichier complet
  const handleDocumentUpdateCallback = useCallback(
    (url, filename) => handleAddNewDocument(url, filename || `Document_${Date.now()}`),
    [handleAddNewDocument]
  );

  const handleAnnotationClickCallback = useCallback(
    (annotation) => handleAnnotationClick(annotation),
    [handleAnnotationClick]
  );

  // Dans le composant PlanViewerPage, ajoutez une fonction qui utilise handleConvertToTask
  const convertToTask = useCallback(() => {
    if (selectedAnnotation) {
      handleConvertToTask(selectedAnnotation);
      toast.success("Tâche créée avec succès!");
      setIsAnnotationDialogOpen(false);
      // Optionnellement, rediriger vers la page des tâches
      // history.push(`/project/${projectId}/tasks`);
    }
  }, [selectedAnnotation, handleConvertToTask, setIsAnnotationDialogOpen]);

  return (
    <div className="flex h-full">
      {isFirstLoad ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des documents...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Sidebar for Documents */}
          {!isMobile && (
            <div className="flex flex-col">
              <DocumentsSidebar
                documents={documents}
                activeDocument={activeDocument}
                onSelectDocument={handleSelectDocument}
              />
              <div className="p-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center"
                  onClick={() => {
                    if (window.confirm("Réinitialiser tous les documents de ce projet?")) {
                      resetProjectData();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col relative">
            {/* Mobile Floating Action Buttons */}
            {isMobile && (
              <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-10">
                <Sheet open={documentsOpen} onOpenChange={setDocumentsOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" className="rounded-full shadow-lg">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                    <DocumentsSidebar
                      documents={documents}
                      activeDocument={activeDocument}
                      onSelectDocument={(doc) => {
                        handleSelectDocument(doc);
                        setDocumentsOpen(false);
                      }}
                    />
                  </SheetContent>
                </Sheet>

                <Sheet open={annotationsOpen} onOpenChange={setAnnotationsOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" className="rounded-full shadow-lg">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0">
                    <AnnotationsSidebar
                      annotations={activeDocument?.annotations || []}
                      onToggleResolved={handleToggleResolved}
                      onAnnotationClick={(annotation) => {
                        handleHighlightAnnotation(annotation);
                        setAnnotationsOpen(false);
                      }}
                      onConvertToTask={handleConvertToTask}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            )}

            <MainContent
              activeDocument={activeDocument}
              annotations={activeDocument?.annotations || []}
              selectedAnnotation={selectedAnnotation}
              onAddAnnotation={handleAddAnnotationCallback}
              onDocumentUpdate={handleDocumentUpdateCallback}
              onAnnotationClick={handleAnnotationClickCallback}
            />
          </div>

          {/* Desktop Sidebar for Annotations */}
          {!isMobile && (
            <ErrorBoundary>
              <AnnotationsSidebar
                annotations={activeDocument?.annotations || []}
                onToggleResolved={handleToggleResolved}
                onAnnotationClick={handleHighlightAnnotation}
                onConvertToTask={handleConvertToTask}
              />
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <AnnotationDialog
              isOpen={isAnnotationDialogOpen}
              setIsOpen={setIsAnnotationDialogOpen}
              selectedAnnotation={selectedAnnotation}
              onToggleResolved={handleToggleResolved}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              onUpdateComment={handleUpdateComment}
              onConvertToTask={handleConvertToTask}
            />
          </ErrorBoundary>

          <ConvertToTaskDialog
            isOpen={isConvertToTaskOpen}
            setIsOpen={setIsConvertToTaskOpen}
            annotation={selectedAnnotation}
            projectId={projectId || "1"}
            onTaskCreated={handleTaskCreated}
          />
        </>
      )}
    </div>
  );
};
