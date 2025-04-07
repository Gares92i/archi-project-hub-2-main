import React, { useEffect, useRef } from "react";
import { FileText, ChevronDown, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "./types";

interface DocumentsSidebarProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (document: Document) => void;
}

export const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
}) => {
  // Effet pour logger les documents à chaque modification
  const prevDocLength = useRef(documents.length);
  useEffect(() => {
    if (prevDocLength.current !== documents.length) {
      console.log("Documents mis à jour dans sidebar:", documents.length);
      prevDocLength.current = documents.length;
    }
  }, [documents]);

  // Raccourcir les noms de fichiers trop longs pour l'affichage
  const formatFileName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 8) + "..." + name.substring(name.length - 8);
    }
    return name;
  };

  return (
    <div className="w-60 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Documents</h2>
        <span className="text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center p-2 rounded hover:bg-accent cursor-pointer">
            <ChevronDown className="h-4 w-4 mr-2" />
            <span className="font-medium text-sm">Plans du projet</span>
          </div>

          <div className="mt-2 ml-6">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Aucun document disponible</p>
                <p className="text-xs mt-1">Ajoutez un plan pour commencer</p>
              </div>
            ) : (
              <>
                <h3 className="mb-1 font-medium text-xs">Documents ({documents.length})</h3>
                <ul className="space-y-1">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className={cn(
                        "flex items-center py-1 px-2 rounded cursor-pointer group",
                        activeDocument?.id === doc.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      )}
                      onClick={() => onSelectDocument(doc)}>
                      <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      <span className="text-xs truncate" title={doc.name}>
                        {formatFileName(doc.name)}
                      </span>
                      {doc.annotations?.length > 0 && (
                        <div className="ml-auto flex-shrink-0 bg-orange-100 text-orange-800 rounded-full h-4 w-4 flex items-center justify-center">
                          <span className="text-[8px] font-bold">
                            {doc.annotations.length}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
