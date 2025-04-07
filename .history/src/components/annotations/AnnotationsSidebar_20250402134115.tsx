
import React from 'react';
import { Check, MessageSquare, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Annotation, AnnotationsSidebarProps } from './types';
import { ScrollArea } from "@/components/ui/scroll-area";

export const AnnotationsSidebar: React.FC<AnnotationsSidebarProps> = ({
  annotations,
  onToggleResolved,
  onAnnotationClick,
  onConvertToTask
}) => {
  return (
    <div className="w-40 border-l bg-card flex flex-col h-full transition-all duration-300 ease-in-out">
      <div className="p-3 border-b">
        <h2 className="font-medium text-sm">Annotations</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {annotations.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">Aucune annotation</p>
          ) : (
            annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={cn(
                  "p-2 rounded border cursor-pointer transition-colors",
                  annotation.isResolved
                    ? "bg-muted/20 border-muted"
                    : "bg-card border-border hover:bg-accent/50"
                )}
                onClick={() => onAnnotationClick(annotation)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-orange-100 text-orange-800 rounded-full flex items-center justify-center w-5 h-5">
                      <span className="text-[9px] font-bold">{annotation.id}</span>
                    </div>
                    <span className="text-xs font-medium">
                      {annotation.author === "Utilisateur" ? "Vous" : annotation.author.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center",
                      annotation.isResolved
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleResolved(annotation.id);
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {annotation.comment}
                </p>
                
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>{annotation.date}</span>
                  {annotation.photos.length > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Image className="h-3 w-3" />
                      <span>{annotation.photos.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
