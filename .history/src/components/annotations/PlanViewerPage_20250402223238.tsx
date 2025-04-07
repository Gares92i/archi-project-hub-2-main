import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MainContent } from '@/components//MainContent';
import { PlanViewer } from './PlanViewer';
import { AnnotationsSidebar } from './AnnotationsSidebar';
import { DocumentsSidebar } from './DocumentsSidebar';
import { AnnotationDialog } from './AnnotationDialog';
import { useAnnotations } from './useAnnotations';

export const PlanViewerPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const {
    documents,
    activeDocument,
    selectedAnnotation,
    isAnnotationDialogOpen,
    handleSelectDocument,
    handleAddAnnotation,
    handleToggleResolved,
    handleAnnotationClick,
    handleAddPhoto,
    handleRemovePhoto,
    handleDocumentUpdate,
    handleUpdateComment,
    setIsAnnotationDialogOpen,
    handleConvertToTask,
    saveAnnotationsState,
    loadAnnotationsState
  } = useAnnotations([], projectId);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      setIsLoadingProject(true);
      try {
        const loaded = loadAnnotationsState();
        if (loaded) {
          toast.success("Documents chargés avec succès");
        }
        setIsLoadingProject(false);
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        toast.error("Erreur lors du chargement du projet");
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId, loadAnnotationsState]);

  useEffect(() => {
    const saveState = () => {
      if (saveAnnotationsState()) {
        console.log("État sauvegardé automatiquement");
      }
    };

    window.addEventListener('beforeunload', saveState);
    const intervalId = setInterval(saveState, 30000);

    return () => {
      saveState();
      window.removeEventListener('beforeunload', saveState);
      clearInterval(intervalId);
    };
  }, [saveAnnotationsState]);

  const handleManualSave = useCallback(() => {
    if (saveAnnotationsState()) {
      toast.success("Projet sauvegardé avec succès");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
  }, [saveAnnotationsState]);

  return (
    <MainContent>
      <div className="flex h-full">
        <DocumentsSidebar
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={handleSelectDocument}
        />

        <div className="flex-1 relative h-full">
          {activeDocument ? (
            <PlanViewer
              document={activeDocument}
              annotations={activeDocument.annotations}
              selectedAnnotation={selectedAnnotation}
              onAddAnnotation={handleAddAnnotation}
              onDocumentUpdate={handleDocumentUpdate}
              onAnnotationClick={handleAnnotationClick}
              projectId={projectId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Sélectionnez un document ou ajoutez-en un nouveau</p>
            </div>
          )}

          <Button
            className="fixed top-4 right-24 z-50 bg-primary text-white shadow-md"
            onClick={handleManualSave}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293z" />
            </svg>
            Sauvegarder
          </Button>
        </div>

        <AnnotationsSidebar
          annotations={activeDocument?.annotations || []}
          onToggleResolved={handleToggleResolved}
          onAnnotationClick={handleAnnotationClick}
          onConvertToTask={handleConvertToTask}
        />
      </div>

      <AnnotationDialog
        isOpen={isAnnotationDialogOpen}
        setIsOpen={setIsAnnotationDialogOpen}
        selectedAnnotation={selectedAnnotation}
        onToggleResolved={handleToggleResolved}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
        onUpdateComment={handleUpdateComment}
        onConvertToTask={handleConvertToTask}
        projectId={projectId || ''}
      />
    </MainContent>
  );
};
