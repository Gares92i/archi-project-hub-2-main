import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Annotation, AnnotationDialogProps } from "./types";
import {
  Image,
  Mail,
  Trash2,
  Plus,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConvertToTaskDialog } from "./ConvertToTaskDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedAnnotation,
  onToggleResolved,
  onAddPhoto,
  onRemovePhoto,
  onUpdateComment,
  onConvertToTask,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isConvertToTaskDialogOpen, setIsConvertToTaskDialogOpen] =
    useState(false);
  const isMobile = useIsMobile();

  const handleSendEmail = () => {
    toast.success("E-mail envoyé avec succès !");
  };

  const handleAddPhoto = () => {
    // Simuler l'ajout d'une photo avec une URL placeholder
    if (selectedAnnotation && onAddPhoto) {
      onAddPhoto(selectedAnnotation.id, "/placeholder.svg");
      toast.success("Photo ajoutée à l'annotation");
    }
  };

  const handleRemovePhoto = (photoIndex: number) => {
    if (selectedAnnotation && onRemovePhoto) {
      onRemovePhoto(selectedAnnotation.id, photoIndex);
      toast.success("Photo supprimée");
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    if (selectedAnnotation && onUpdateComment) {
      onUpdateComment(selectedAnnotation.id, newComment);
      setNewComment("");
      toast.success("Commentaire ajouté");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent
          className={cn(
            "sm:max-w-md",
            isMobile && "p-4 w-[calc(100vw-32px)] max-h-[80vh] overflow-y-auto"
          )}>
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg">
                {selectedAnnotation
                  ? `${selectedAnnotation.id} commentaire`
                  : ""}
              </DialogTitle>
              <DialogDescription>
                Consultez et modifiez les détails de cette annotation.
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSendEmail}
                title="Envoyer par email">
                <Mail className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (selectedAnnotation) {
                    onToggleResolved(selectedAnnotation.id);
                  }
                }}
                title={
                  selectedAnnotation?.isResolved
                    ? "Marquer comme non résolu"
                    : "Marquer comme résolu"
                }>
                <CheckCircle
                  className={cn(
                    "h-4 w-4",
                    selectedAnnotation?.isResolved
                      ? "text-green-500"
                      : "text-muted-foreground"
                  )}
                />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsConvertToTaskDialogOpen(true);
                    }}>
                    Convertir en tâche
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>

          <DialogDescription className="pt-2 pb-4 border-b">
            {selectedAnnotation?.date} par {selectedAnnotation?.author}
          </DialogDescription>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {selectedAnnotation?.author
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm">{selectedAnnotation?.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedAnnotation?.date}
                </p>

                {selectedAnnotation?.photos &&
                  selectedAnnotation.photos.length > 0 && (
                    <div
                      className={cn(
                        "grid gap-2 mt-3",
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      )}>
                      {selectedAnnotation.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="rounded-md object-cover h-24 w-full"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePhoto(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddPhoto}
                className="h-8 w-8">
                <Image className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Textarea
                  placeholder="Votre commentaire..."
                  className="min-h-[80px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <Button className="h-8" onClick={handleSubmitComment}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 2L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConvertToTaskDialog
        isOpen={isConvertToTaskDialogOpen}
        setIsOpen={setIsConvertToTaskDialogOpen}
        annotation={selectedAnnotation}
        projectId={(selectedAnnotation && selectedAnnotation.projectId) || "1"}
        onTaskCreated={() => {
          setIsConvertToTaskDialogOpen(false);
          setIsOpen(false);
          if (onConvertToTask) {
            onConvertToTask();
          }
        }}
      />
    </>
  );
};
