import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { DialogDocumentName } from "./DialogDocumentName";

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

  // Réinitialiser l'état quand le composant est démonté
  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFileDataUrl(null);
    };
  }, []);

  // Assurez-vous que cette fonction est correctement modifiée pour appeler setIsNamingDialogOpen(true)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }
    
    const cleanFilename = file.name.replace(/[^\w\s.-]/g, '_');
    const loadingToast = toast.loading(`Lecture de ${cleanFilename} en cours...`);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          
          // Important: définir ces états avant d'ouvrir le dialogue
          setSelectedFile(file);
          setFileDataUrl(dataUrl);
          
          // IMPORTANT: S'assurer que cette ligne est exécutée
          console.log("Ouverture du dialogue de nommage");
          setIsNamingDialogOpen(true);
          
          toast.dismiss(loadingToast);
        } else {
          toast.dismiss(loadingToast);
          toast.error(`Échec du traitement de ${cleanFilename}`);
        }
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error(`Échec du téléchargement de ${cleanFilename}`);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Échec du téléchargement de ${cleanFilename}`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDocumentNameConfirmed = (documentName: string) => {
    if (fileDataUrl) {
      // Utiliser le nom fourni par l'utilisateur
      onDocumentUpdate(fileDataUrl, documentName);
      
      // Réinitialiser l'état
      setSelectedFile(null);
      setFileDataUrl(null);
      setIsNamingDialogOpen(false);

      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast.success(`Document "${documentName}" ajouté avec succès`);
    }
  };

  const handleDialogClosed = () => {
    setIsNamingDialogOpen(false);
    setSelectedFile(null);
    setFileDataUrl(null);

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fonction pour optimiser les images
  const optimizeImage = (dataUrl: string, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Créer un canvas pour redimensionner l'image
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionner si l'image est plus large que maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible de créer le contexte 2D"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en JPEG avec une qualité de 0.8 (80%)
        const optimizedUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(optimizedUrl);
      };

      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,image/*"
        className="hidden"
      />

      <DialogDocumentName
        isOpen={isNamingDialogOpen}
        onClose={handleDialogClosed}
        onSave={handleDocumentNameConfirmed}
        defaultName={selectedFile?.name.replace(/\.[^/.]+$/, "") || ""}
      />
    </>
  );
};
