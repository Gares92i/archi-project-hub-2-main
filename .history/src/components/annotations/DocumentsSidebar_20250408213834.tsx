import React, { useEffect, useRef, useState } from "react";
import { FileText, ChevronDown, FolderOpen, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "./types";
import { Button } from "@/components/ui/button";
import { DialogDocumentName } from "@/components/annotations/DialogDocumentName";

interface DocumentsSidebarProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onAddDocument?: () => void;
}

export const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onAddDocument,
}) => {
  // Effet pour logger les documents à chaque modification
  const prevDocLength = useRef(documents.length);

  useEffect(() => {
    if (prevDocLength.current !== documents.length) {
      console.log(
        "Documents mis à jour dans sidebar:",
        documents.map((d) => ({ id: d.id, name: d.name }))
      );
      prevDocLength.current = documents.length;
    }
  }, [documents]);

  // Ajoutez une référence pour faire défiler automatiquement vers le document actif
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeDocument?.id]);

  // Raccourcir les noms de fichiers trop longs pour l'affichage
  const formatFileName = (name: string) => {
    if (!name) return "Sans titre";
    if (name.length > 20) {
      return name.substring(0, 8) + "..." + name.substring(name.length - 8);
    }
    return name;
  };

  // Tri des documents : les plus récents en premier (ID contient timestamp)
  const sortedDocuments = [...documents].sort((a, b) => {
    const idA = a.id.includes("-") ? parseInt(a.id.split("-")[1]) : 0;
    const idB = b.id.includes("-") ? parseInt(b.id.split("-")[1]) : 0;
    return idB - idA; // Ordre décroissant (plus récent en premier)
  });

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [newDocumentName, setNewDocumentName] = useState<string>("");

  const handleDocumentRename = (document: Document) => {
    setSelectedDocument(document);
    setIsRenameDialogOpen(true);
  };

  const handleDocumentNameSave = (name: string) => {
      if (!selectedDocument) return;
  
      const updatedDocuments = [...documents];
      const index = updatedDocuments.findIndex(
        (doc) => doc.id === selectedDocument.id
      );
      if (index !== -1) {
        updatedDocuments[index].name = name;
      }
  
      onSelectDocument(
        updatedDocuments.find((doc) => doc.id === selectedDocument.id)!
      );
      setIsRenameDialogOpen(false);
    };

  const handleDialogClosed = () => {
    setIsRenameDialogOpen(false);
    setSelectedDocument(null);
    setNewDocumentName("");
  };

  return (
    <div className="w-60 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Documents</h2>
        <span className="text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer">
            <div className="flex items-center">
              <ChevronDown className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Plans du projet</span>
            </div>
            {onAddDocument && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDocument();
                }}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-2 ml-6">
            {sortedDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Aucun document disponible</p>
                <p className="text-xs mt-1">Ajoutez un plan pour commencer</p>
                {onAddDocument && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onAddDocument}>
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter un document
                  </Button>
                )}
              </div>
            ) : (
              <>
                <h3 className="mb-1 font-medium text-xs">
                  Documents ({sortedDocuments.length})
                </h3>
                <ul className="space-y-1">
                  {sortedDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      ref={activeDocument?.id === doc.id ? activeItemRef : null}
                      className={cn(
                        "flex items-center py-1 px-2 rounded cursor-pointer group transition-colors",
                        activeDocument?.id === doc.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent"
                      )}
                      onClick={() => onSelectDocument(doc)}>
                      <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      <span
                        className="text-xs truncate max-w-[150px]"
                        title={doc.name}>
                        {formatFileName(doc.name)}
                      </span>
                      {doc.annotations?.length > 0 && (
                        <div className="ml-auto flex-shrink-0 bg-orange-100 text-orange-800 rounded-full h-4 w-4 flex items-center justify-center">
                          <span className="text-[8px] font-bold">
                            {doc.annotations.length}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentRename(doc);
                        }}>
                        <Pencil className="h-2 w-2 mr-0.5 flex-shrink-0" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ajoutez un indicateur de document actif */}
      {activeDocument && (
        <div className="px-3 py-2 border-t text-xs text-muted-foreground">
          <p className="truncate font-medium">Document actif:</p>
          <p className="truncate italic">{activeDocument.name}</p>
        </div>
      )}

      {isRenameDialogOpen && (
        <DialogDocumentName
          isOpen={isRenameDialogOpen}
          onClose={handleDialogClosed}
          onSave={(name) => handleDocumentNameSave(name)}
          defaultName={selectedDocument?.name || ""}
        />
      )}
    </div>
  );
};
