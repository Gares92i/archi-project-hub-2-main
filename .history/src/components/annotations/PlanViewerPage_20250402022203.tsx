import React, { useState } from "react";
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
import { FileText, MessageSquare } from "lucide-react";
import { useParams } from "react-router-dom";

export const PlanViewerPage = () => {
  // Initial documents data with explicit type values as "pdf" or "img"
  const initialDocuments: Document[] = [
    {
      id: "1",
      name: "Ouvrage - Pr...PS - page-1",
      type: "pdf",
      url: "/placeholder.svg",
      annotations: [],
    },
    {
      id: "2",
      name: "Ouvrage - Pr...PS - page-2",
      type: "pdf",
      url: "/placeholder.svg",
      annotations: [],
    },
    {
      id: "3",
      name: "Ouvrage - Pr...PS - page-3",
      type: "pdf",
      url: "/placeholder.svg",
      annotations: [],
    },
    {
      id: "4",
      name: "Ouvrage - Pr...PS - page-4",
      type: "pdf",
      url: "/placeholder.svg",
      annotations: [],
    },
    {
      id: "5",
      name: "Ouvrage - Pr...PS - page-5",
      type: "pdf",
      url: "/placeholder.svg",
      annotations: [],
    },
  ];

  const isMobile = useIsMobile();
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [isConvertToTaskOpen, setIsConvertToTaskOpen] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();

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

    handleHighlightAnnotation,
    handleAddPhoto,
    handleRemovePhoto,
    handleUpdateComment,
  } = useAnnotations(initialDocuments);

  const handleConvertToTask = () => {
    if (selectedAnnotation) {
      setIsConvertToTaskOpen(true);
    } else {
      toast.error("Veuillez sélectionner une annotation à convertir en tâche");
    }
  };
  const handleAnnotationClick = (annotationId: string) => {
    // function body
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

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar for Documents */}
      {!isMobile && (
        <DocumentsSidebar
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={handleSelectDocument}
        />
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
                   handleHighlightAnnotation(annotation.id);
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
          onDocumentUpdate={handleDocumentUpdate}
         onAnnotationClick={(annotationId) => handleHighlightAnnotation(annotationId)}
          projectId={projectId || "1"}
        />
      </div>

      {/* Desktop Sidebar for Annotations */}
      {!isMobile && (
        <AnnotationsSidebar
          annotations={activeDocument?.annotations || []}
          onToggleResolved={handleToggleResolved}
          onAnnotationClick={handleHighlightAnnotation}
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
        projectId={projectId || "1"}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
