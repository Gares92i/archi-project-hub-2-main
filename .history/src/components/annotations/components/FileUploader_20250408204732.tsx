import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { DialogDocumentName } from "@/components/annotations/DialogDocumentName";

interface FileUploaderProps {
  onDocumentUpdate: (url: string, filename: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDocumentUpdate,
  fileInputRef,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsNamingDialogOpen(true);
  };

  const handleDocumentNameSave = () => {
    if (!selectedFile) return;

    onDocumentUpdate(fileDataUrl!, newDocumentName);
    setIsNamingDialogOpen(false);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
      {isNamingDialogOpen && (
        <DialogDocumentName
          isOpen={isNamingDialogOpen}
          onClose={() => setIsNamingDialogOpen(false)}
          onNameChange={(event) => setNewDocumentName(event.target.value)}
          onNameSave={handleDocumentNameSave}
          defaultName={selectedFile?.name}
        />
      )}
    </div>
  );
};