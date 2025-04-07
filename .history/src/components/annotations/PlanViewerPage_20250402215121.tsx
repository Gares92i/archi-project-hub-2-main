import React, { useState, useEffect } from 'react';
import { DocumentsSidebar } from './DocumentsSidebar';
import { AnnotationsSidebar } from './AnnotationsSidebar';
import { MainContent } from './MainContent';
import { AnnotationDialog } from './AnnotationDialog';
import { ConvertToTaskDialog } from './ConvertToTaskDialog';
import { toast } from "sonner";
import { useAnnotations } from './useAnnotations';
import { useDocumentStorage } from './hooks/useDocumentStorage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Save } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const PlanViewerPage = () => {
  const { projectId = '1' } = useParams();
  const { documents, setDocuments } = useDocumentStorage(projectId);

  const isMobile = useIsMobile();
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [isConvertToTaskOpen, setIsConvertToTaskOpen] = useState(false);

  const {
    activeDocument,
    setActiveDocument,
    selectedAnnotation,
    setSelectedAnnotation,
    isAnnotationDialogOpen,
    setIsAnnotationDialogOpen,
    handleSelectDocument,
    handleAddAnnotation,
    handleToggleResolved,
    handleUpdateComment,
    handleAddPhoto,
    handleRemovePhoto,
    handleDocumentUpdate,
    addNewDocument,
    saveAnnotationsState,
    loadAnnotationsState,
    saveActiveDocumentId
  } = useAnnotations(documents);

  // Synchroniser les documents avec le stockage
  useEffect(() => {
    setDocuments(documents);
  }, [documents, setDocuments]);

  // Charger et sauvegarder l'état des annotations
  useEffect(() => {
    // Essayer de charger l'état sauvegardé pour ce projet
    loadAnnotationsState(projectId || 'default');
    
    // Sauvegarder l'état en quittant la page
    return () => {
      saveAnnotationsState();
      saveActiveDocumentId(projectId || 'default');
    };
  }, [projectId, loadAnnotationsState, saveAnnotationsState, saveActiveDocumentId]);

  const handleConvertToTask = () => {
    if (selectedAnnotation) {
      setIsConvertToTaskOpen(true);
    } else {
      toast.error("Veuillez sélectionner une annotation à convertir en tâche");
    }
  };

  const handleTaskCreated = () => {
    setIsConvertToTaskOpen(false);
    if (selectedAnnotation) {
      handleToggleResolved(selectedAnnotation.id);
      toast.success("L'annotation a été convertie en tâche et marquée comme résolue");
    }
  };

  const handleAddNewDocument = (url: string, filename: string) => {
    const type = url.startsWith('data:application/pdf') ? 'pdf' as const : 'img' as const;

    console.log('Ajout d\'un nouveau document:', {
      url: url.substring(0, 30) + '...', 
      filename, 
      type 
    });

    if (activeDocument) {
      console.log('Mise à jour du document existant:', activeDocument.id);
      handleDocumentUpdate(url, filename);
    } else {
      console.log('Création d\'un nouveau document');
      addNewDocument(url, filename, type);

      setTimeout(() => {
        console.log('État après ajout:', { 
          documents: documents.length, 
          activeDoc: activeDocument?.name 
        });
      }, 100);
    }
  };

  const handleSaveState = () => {
    saveAnnotationsState();
    toast.success('État des annotations sauvegardé');
  };

  return (
    <div className="flex h-full">
      {!isMobile && (
        <DocumentsSidebar
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={handleSelectDocument}
        />
      )}

      <div className="flex-1 flex flex-col relative">
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
                    setSelectedAnnotation(annotation);
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
          onAddAnnotation={handleAddAnnotation}
          onDocumentUpdate={(url, filename) => handleAddNewDocument(url, filename || "")}
          onAnnotationClick={setSelectedAnnotation}
        />
      </div>

      {!isMobile && (
        <AnnotationsSidebar
          annotations={activeDocument?.annotations || []}
          onToggleResolved={handleToggleResolved}
          onAnnotationClick={setSelectedAnnotation}
          onConvertToTask={handleConvertToTask}
        />
      )}

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

      <ConvertToTaskDialog
        isOpen={isConvertToTaskOpen}
        setIsOpen={setIsConvertToTaskOpen}
        annotation={selectedAnnotation}
        projectId={projectId}
        onTaskCreated={handleTaskCreated}
      />

      <Button
        className="fixed top-2 right-2 z-50"
        variant="outline"
        onClick={() => {
          console.log('État actuel:', { 
            documents: documents.map(d => ({ id: d.id, name: d.name })), 
            activeDocument: activeDocument?.name
          });
          toast.success("État actualisé");
        }}
      >
        Actualiser
      </Button>

      <Button
        className="fixed top-2 right-20 z-50"
        variant="outline"
        onClick={handleSaveState}
      >
        <Save className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
};
