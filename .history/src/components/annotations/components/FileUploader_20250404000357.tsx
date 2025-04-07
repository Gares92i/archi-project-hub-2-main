import React from "react";
import { toast } from "sonner";

interface FileUploaderProps {
  onDocumentUpdate: (url: string, filename?: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDocumentUpdate,
  fileInputRef,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      console.log("Fichier chargé:", file.name);
      
      if (onDocumentUpdate) {
        // Assurer que le nom du fichier est bien passé
        onDocumentUpdate(dataUrl, file.name);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Document téléchargé avec succès");
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
