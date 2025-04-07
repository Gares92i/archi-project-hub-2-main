import React from 'react';
import { toast } from 'sonner';

interface FileUploaderProps {
  onDocumentUpdate: (url: string, filename: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onDocumentUpdate, 
  fileInputRef 
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name);

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      console.log('File read successfully', file.name);
      
      if (onDocumentUpdate) {
        onDocumentUpdate(dataUrl, file.name);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast.error("Erreur lors de la lecture du fichier");
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      accept=".pdf,image/*"
      className="hidden"
    />
  );
};
