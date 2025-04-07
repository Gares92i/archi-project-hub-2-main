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

  // Fonction pour vérifier si une URL base64 est valide
  const isValidDataUrl = (url: string): boolean => {
    // Vérifiez que l'URL commence par "data:" et contient au moins une virgule
    return url.startsWith("data:") && url.includes(",") && url.length > 50;
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
      // Utiliser une approche plus robuste pour lire le fichier
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          
          // Vérifier que l'URL est valide avant de continuer
          if (!isValidDataUrl(dataUrl)) {
            console.error("URL de données invalide générée");
            toast.dismiss(loadingToast);
            toast.error("Erreur lors du traitement du fichier");
            return;
          }
          
          // Pour les grandes images, optimisez-les
          if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
            try {
              const optimizedUrl = await optimizeImage(dataUrl, 2000);
              if (!isValidDataUrl(optimizedUrl)) {
                throw new Error("L'URL optimisée n'est pas valide");
              }
              
              setSelectedFile(file);
              setFileDataUrl(optimizedUrl);
              setIsNamingDialogOpen(true);
              
              toast.dismiss(loadingToast);
              toast.success("Image optimisée avec succès");
            } catch (err) {
              console.error("Erreur lors de l'optimisation:", err);
              // En cas d'erreur, utiliser l'image originale si elle est valide
              setSelectedFile(file);
              setFileDataUrl(dataUrl);
              setIsNamingDialogOpen(true);
              
              toast.dismiss(loadingToast);
            }
          } else {
            // Pour les petites images et PDFs
            setSelectedFile(file);
            setFileDataUrl(dataUrl);
            setIsNamingDialogOpen(true);
            
            toast.dismiss(loadingToast);
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture du fichier");
        }
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error(`Erreur lors de la lecture de ${cleanFilename}`);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du traitement du fichier:", error);
      toast.dismiss(loadingToast);
      toast.error(`Erreur lors du traitement de ${cleanFilename}`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDocumentNameConfirmed = (documentName: string) => {
    console.log("Nom confirmé:", documentName);
    if (fileDataUrl && isValidDataUrl(fileDataUrl)) {
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
    } else {
      toast.error("Données d'image invalides");
      setIsNamingDialogOpen(false);
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
        try {
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
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => {
        console.error("Erreur lors du chargement de l'image:", err);
        reject(new Error("Erreur lors du chargement de l'image"));
      };
      
      // Ajouter un gestionnaire d'erreurs pour les erreurs réseau
      img.addEventListener('error', (err) => {
        console.error("Erreur lors du chargement de l'image (listener):", err);
        reject(err);
      });
      
      // Définir un timeout pour éviter de bloquer indéfiniment
      const timeout = setTimeout(() => {
        reject(new Error("Timeout lors du chargement de l'image"));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        try {
          // Le code de traitement de l'image...
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

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
          
          const optimizedUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(optimizedUrl);
        } catch (err) {
          reject(err);
        }
      };
      
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
