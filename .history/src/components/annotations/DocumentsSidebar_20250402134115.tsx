
import React from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from './types';

interface DocumentsSidebarProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (document: Document) => void;
}

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
                <li 
                  key={doc.id}
                  className={cn(
                    "flex items-center py-1 px-2 rounded cursor-pointer group",
                    activeDocument?.id === doc.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => onSelectDocument(doc)}
                >
                  <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                  <span className="text-xs truncate">{doc.name}</span>
                  {doc.annotations.length > 0 && (
                    <div className="ml-auto flex-shrink-0 bg-orange-100 text-orange-800 rounded-full h-4 w-4 flex items-center justify-center">
                      <span className="text-[8px] font-bold">{doc.annotations.length}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
