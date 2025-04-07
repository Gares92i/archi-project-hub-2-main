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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the custom hook to manage annotations state and logic
  const {
    documents,
    activeDocument,
    selectedAnnotation,
    setSelectedAnnotation, // Assurez-vous que cette ligne est présente
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

  // Ajoutez ce log pour déboguer les annotations

  // Dans PlanViewerPage.tsx après la définition de vos états
  useEffect(() => {
    if (activeDocument) {
      console.log("Document actif:", activeDocument.name);
      console.log("Annotations sur ce document:", activeDocument.annotations?.length || 0);
      console.log("Annotations détails:", activeDocument.annotations);
    }
  }, [activeDocument]);

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

      // Assurez-vous que le nom du document est bien préservé
      const cleanFilename = filename || `Document_${Date.now()}`;
      addNewDocument(url, cleanFilename, type);
      
      // Afficher un message de succès directement
      console.log("Nouveau document ajouté:", cleanFilename);
      toast.success(`Document "${cleanFilename}" ajouté avec succès`);

    } catch (error) {
      console.error("Erreur dans handleAddNewDocument:", error);
      toast.error("Erreur lors de l'ajout du document");
    }
  }, [addNewDocument]);

  const handleAddAnnotationCallback = useCallback(
    (position) => {
      console.log("handleAddAnnotationCallback:", position);
      handleAddAnnotation(position);
    },
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

  // Fonction pour ouvrir le sélecteur de fichier
  const handleOpenFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Ajout de la fonction pour supprimer des annotations
  const handleDeleteAnnotation = useCallback((annotation: Annotation) => {
    if (!activeDocument) return;
    
    // Filtrer l'annotation à supprimer
    const updatedAnnotations = activeDocument.annotations?.filter(a => a.id !== annotation.id) || [];
    
    // Créer un document mis à jour
    const updatedDocument = {
      ...activeDocument,
      annotations: updatedAnnotations
    };
    
    // Mettre à jour les documents
    const updatedDocuments = documents.map(doc =>
      doc.id === activeDocument.id ? updatedDocument : doc
    );
    
    // Mettre à jour l'état et localStorage
    setDocuments(updatedDocuments);
    
    // Fermer la boîte de dialogue et réinitialiser l'annotation sélectionnée
    setIsAnnotationDialogOpen(false);
    if (setSelectedAnnotation) {
      setSelectedAnnotation(null);
    }
    
    // Message de confirmation
    toast.success("Annotation supprimée avec succès");
  }, [activeDocument, documents, setDocuments, setIsAnnotationDialogOpen, setSelectedAnnotation]);

  const handleRepositionAnnotation = useCallback((annotationId: string, newPosition: { x: number; y: number }) => {
    if (!activeDocument || !handleUpdateAnnotation) return;
    
    console.log(`Repositionnement de l'annotation ${annotationId} vers:`, newPosition);
    
    handleUpdateAnnotation(annotationId, {
      x: newPosition.x,
      y: newPosition.y,
      position: { x: newPosition.x, y: newPosition.y }
    });
    
    toast.success("Position de l'annotation mise à jour");
  }, [activeDocument, handleUpdateAnnotation]);

  // Ajoutez cette fonction pour permettre l'export des annotations
  const exportAnnotations = useCallback(() => {
    if (!documents || documents.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }
    
    try {
      const dataStr = JSON.stringify(documents, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportName = `annotations-${projectId}-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Créer un élément <a> temporaire et le simuler un clic
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportName);
      linkElement.style.display = "none";
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      toast.success("Export des annotations réussi");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export des annotations");
    }
  }, [documents, projectId]);

  return (
    <div className="flex h-full">
      {isFirstLoad ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Bienvenue dans l'éditeur d'annotations</h2>
            <p className="text-muted-foreground mb-6">Ajoutez des plans ou images pour commencer à les annoter</p>
            <Button onClick={handleOpenFileSelector}>
              <FileText className="mr-2 h-4 w-4" />
              Ajouter un document
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && e.target.result) {
                      handleAddNewDocument(e.target.result.toString(), file.name);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
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
                onAddDocument={handleOpenFileSelector}
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
            {/* Toolbar buttons */}
            <div className="bg-muted py-1 px-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenFileSelector}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Ajouter un document
                </Button>
                <Button onClick={exportAnnotations}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter les annotations
                </Button>
              </div>
              
              {isMobile && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDocumentsOpen(true)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAnnotationsOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
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
              onDeleteAnnotation={handleDeleteAnnotation}
              onRepositionAnnotation={handleRepositionAnnotation}
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
                onDeleteAnnotation={handleDeleteAnnotation}
              />
              {/* Compteur d'annotations pour débogage */}
              <div className="absolute top-0 right-0 bg-black/50 text-white text-xs p-1 m-1 rounded">
                Annotations: {activeDocument?.annotations?.length || 0}
              </div>
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <AnnotationDialog
              isOpen={isAnnotationDialogOpen}
              setIsOpen={setIsAnnotationDialogOpen}
              selectedAnnotation={selectedAnnotation}
              onToggleResolved={handleToggleResolved}
              onUpdateAnnotation={handleUpdateAnnotation}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              onUpdateComment={handleUpdateComment}
              onConvertToTask={convertToTask}
              onDeleteAnnotation={handleDeleteAnnotation}
            />
          </ErrorBoundary>

          <ConvertToTaskDialog
            isOpen={isConvertToTaskOpen}
            setIsOpen={setIsConvertToTaskOpen}
            annotation={selectedAnnotation}
            projectId={projectId || "1"}
            onTaskCreated={handleTaskCreated}
          />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target && e.target.result) {
                    handleAddNewDocument(e.target.result.toString(), file.name);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </>
      )}
    </div>
  );
};
