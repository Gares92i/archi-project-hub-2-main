import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MainContent } from '@/components/annotations/MainContent';
import { PlanViewer } from './PlanViewer';
import { AnnotationsSidebar } from './AnnotationsSidebar';
import { DocumentsSidebar } from './DocumentsSidebar';
import { AnnotationDialog } from './AnnotationDialog';
import { useAnnotations } from './useAnnotations';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

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
    saveState,
  } = useAnnotations([]);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      setIsLoadingProject(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Projet chargé:', projectId);
        setIsLoadingProject(false);
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        toast.error("Erreur lors du chargement du projet");
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId]);

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
            className="fixed top-2 right-20 z-50"
            variant="outline"
            onClick={() => {
              saveState();
              toast.success("État sauvegardé");
            }}
          >
            <Save className="h-4 w-4 mr-2" />
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
