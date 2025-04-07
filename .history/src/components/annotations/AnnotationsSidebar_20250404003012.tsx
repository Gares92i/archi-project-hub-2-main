import React from "react";
import { Annotation } from "./types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Filter, PlusCircle } from "lucide-react";

interface AnnotationsSidebarProps {
  annotations: Annotation[];
  onToggleResolved: (id: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  onConvertToTask: () => void;
}

export const AnnotationsSidebar: React.FC<AnnotationsSidebarProps> = ({
  annotations = [], // Valeur par défaut pour éviter les erreurs
  onToggleResolved,
  onAnnotationClick,
  onConvertToTask,
}) => {
  // Protection contre les valeurs null ou undefined
  const safeAnnotations = annotations || [];
  
  const resolvedCount = safeAnnotations.filter(
    (ann) => ann && ann.resolved
  ).length;
  const pendingCount = safeAnnotations.length - resolvedCount;

  return (
    <div className="w-64 border-l bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Annotations</h2>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 border-b flex justify-between text-xs">
        <div>
          <span className="text-muted-foreground">En attente:</span>{" "}
          <span className="font-medium">{pendingCount}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Résolues:</span>{" "}
          <span className="font-medium">{resolvedCount}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {safeAnnotations.length > 0 ? (
          <div className="p-2 space-y-2">
            {safeAnnotations.map((annotation) => {
              // Vérification de sécurité pour chaque annotation
              if (!annotation) return null;
              
              return (
                <div
                  key={annotation.id}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-accent"
                  onClick={() => onAnnotationClick(annotation)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="h-6 w-6 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleResolved(annotation.id);
                      }}
                    >
                      {annotation.resolved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(annotation.createdAt || new Date().toISOString())}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">
                    {annotation.comment || "Aucun commentaire"}
                  </p>
                  {annotation.photos && annotation.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {annotation.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="h-10 w-10 rounded bg-muted overflow-hidden"
                        >
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvertToTask();
                      }}
                    >
                      Créer une tâche
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Aucune annotation</p>
            <p className="text-sm mt-1">
              Cliquez sur le bouton + pour ajouter une annotation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
