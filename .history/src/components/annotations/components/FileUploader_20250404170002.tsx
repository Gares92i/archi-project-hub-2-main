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
  // Modifiez la fonction handleFileUpload pour mieux gérer les types de fichiers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }

    // Nettoyer le nom de fichier pour éviter des problèmes
    const cleanFilename = file.name.replace(/[^\w\s.-]/g, '_');
    
    // Afficher un toast de chargement
    const loadingToast = toast.loading(`Téléchargement de ${cleanFilename} en cours...`);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // Vérifier que dataUrl est valide
        if (!dataUrl || dataUrl === 'data:') {
          console.error("URL de données invalide");
          toast.dismiss(loadingToast);
          toast.error(`Échec du traitement de ${cleanFilename}`);
          return;
        }
        
        // Pour les fichiers image, optimiser avant le stockage
        if (file.type.startsWith("image/")) {
          try {
            const optimizedUrl = await optimizeImage(dataUrl, 1200);
            console.log("Image optimisée et téléchargée:", cleanFilename);
            if (onDocumentUpdate) {
              onDocumentUpdate(optimizedUrl, cleanFilename);
            }
          } catch (err) {
            console.error("Erreur lors de l'optimisation de l'image:", err);
            // Fallback: utiliser l'image originale si l'optimisation échoue
            if (onDocumentUpdate) {
              onDocumentUpdate(dataUrl, cleanFilename);
            }
          }
        } else {
          console.log("Fichier PDF téléchargé:", cleanFilename);
          if (onDocumentUpdate) {
            onDocumentUpdate(dataUrl, cleanFilename);
          }
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        toast.dismiss(loadingToast);
        toast.success(`Document "${cleanFilename}" téléchargé avec succès`);
      };

      reader.onerror = (error) => {
        console.error("Erreur de lecture du fichier:", error);
        toast.dismiss(loadingToast);
        toast.error(`Échec du téléchargement de ${cleanFilename}`);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.dismiss(loadingToast);
      toast.error(`Échec du téléchargement de ${cleanFilename}`);
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
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileUpload}
      accept=".pdf,image/*"
      className="hidden"
    />
  );
};
