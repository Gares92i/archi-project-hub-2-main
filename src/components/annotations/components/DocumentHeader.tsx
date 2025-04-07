
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DocumentHeaderProps {
  documentName: string;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentName,
  onUploadClick,
  fileInputRef,
  onFileChange
}) => {
  return (
    <div className="mb-2 flex justify-between items-center">
      <h3 className="text-lg font-medium truncate max-w-[500px]" title={documentName}>
        {documentName}
      </h3>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onUploadClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Télécharger un document
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".pdf,image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
