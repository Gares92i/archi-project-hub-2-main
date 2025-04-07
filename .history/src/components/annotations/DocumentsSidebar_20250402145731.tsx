import React from 'react';
import { FileText, ChevronDown, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from './types';

interface DocumentsSidebarProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (document: Document) => void;
}

interface DocumentItemProps {
  document: Document;
  isActive: boolean;
  onClick: (document: Document) => void;
}

const DocumentItem = ({ document, isActive, onClick }: DocumentItemProps) => {
  // Déterminer l'icône en fonction du type de document
  const DocumentIcon = document.type === 'pdf' ? FileText : Image;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer rounded hover:bg-accent",
        isActive && "bg-accent"
      )}
      onClick={() => onClick(document)}
    >
      <DocumentIcon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm truncate">{document.name}</span>
      {document.annotations.length > 0 && (
        <div className="ml-auto bg-primary/10 text-primary px-1 rounded text-xs">
          {document.annotations.length}
        </div>
      )}
    </div>
  );
};
export const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
  documents,
  activeDocument,
  onSelectDocument
}) => {
  return (
    <div className="w-40 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Documents</h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center p-2 rounded hover:bg-accent cursor-pointer">
            <ChevronDown className="h-4 w-4 mr-2" />
            <span className="font-medium text-sm">Brouillon</span>
          </div>
          
          <div className="flex items-center p-1 text-xs text-muted-foreground">
            <span className="ml-6">V2 14/02/2025</span>
          </div>
          
          <div className="mt-2 ml-6">
            <h3 className="mb-1 font-medium text-xs">Documents</h3>
            <ul className="space-y-1">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <DocumentItem 
                    document={doc} 
                    isActive={activeDocument?.id === doc.id} 
                    onClick={onSelectDocument} 
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
