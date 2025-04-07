import React, { useState, useEffect } from "react";
import { toast } from "sonner";
// Vérifiez ce chemin d'import
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

  // Réinitialiser l'état quand le composant est démonté
  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFileDataUrl(null);
    };
  }, []);

  // Fonction pour manipuler les données du fichier et ouvrir la boîte de dialogue
  const processFile = (file: File, dataUrl: string) => {
    setSelectedFile(file);
    setFileDataUrl(dataUrl);
    // Force l'état à true et log pour débogage
    console.log("Définition de isNamingDialogOpen à true");
    setIsNamingDialogOpen(true);
  };

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
      // Pour les grandes images, optimisez-les avant de les charger
      if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        // Si l'image dépasse 5Mo, optimisons-la
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          if (e.target?.result) {
            const dataUrl = e.target.result as string;
            
            try {
              // Optimiser l'image
              const optimizedUrl = await optimizeImage(dataUrl, 2000); // Max width 2000px
              
              // Stocker les données avant d'ouvrir le dialogue
              processFile(file, optimizedUrl);
              
              toast.dismiss(loadingToast);
              toast.success("Image optimisée pour de meilleures performances");
            } catch (err) {
              console.error("Erreur lors de l'optimisation:", err);
              // En cas d'erreur, utiliser l'image originale
              processFile(file, dataUrl);
              
              toast.dismiss(loadingToast);
            }
          }
        };
        
        reader.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error(`Échec du téléchargement de ${cleanFilename}`);
        };
        
        reader.readAsDataURL(file);
      } else {
        // Pour les petites images et les PDFs, chargez-les normalement
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target?.result) {
            const dataUrl = e.target.result as string;

            // Stocker les données avant d'ouvrir le dialogue
            processFile(file, dataUrl);
            
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
      }
    } catch (error) {
      console.error("Erreur lors du traitement du fichier:", error);
      toast.dismiss(loadingToast);
      toast.error(`Échec du téléchargement de ${cleanFilename}`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDocumentNameConfirmed = (documentName: string) => {
    console.log("Nom confirmé:", documentName);
    if (fileDataUrl) {
      onDocumentUpdate(fileDataUrl, documentName);
      
      // Réinitialiser l'état
      setSelectedFile(null);
      setFileDataUrl(null);
      setIsNamingDialogOpen(false);

      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
