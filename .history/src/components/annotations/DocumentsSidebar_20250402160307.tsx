import React from 'react';
import { Document } from './types';
import { cn } from '@/lib/utils';
import { FileText, Image } from 'lucide-react';

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

const DocumentItem: React.FC<DocumentItemProps> = ({ document, isActive, onClick }) => {
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
  onSelectDocument,
}) => {
  return (
    <div className="w-64 border-r h-full p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Documents</h2>
      
      <div className="overflow-y-auto flex-1">
        {documents.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            Aucun document disponible
          </div>
        ) : (
          documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              isActive={document.id === activeDocument?.id}
              onClick={onSelectDocument}
            />
          ))
        )}
      </div>
      

      {console.log('DocumentsSidebar render:', { documents, activeDocument })}
    </div>
  );
};
