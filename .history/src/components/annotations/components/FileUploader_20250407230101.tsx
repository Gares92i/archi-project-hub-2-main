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

  // Fonction pour vérifier si une URL de données est valide
  const isValidDataUrl = (url: string): boolean => {
    return url.startsWith('data:') && url.includes(',') && url.length > 100;
  };

  // Réinitialiser l'état quand le composant est démonté
  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFileDataUrl(null);
    };
  }, []);

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
      // Pour les images volumineuses, limiter la taille
      if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            try {
              // Optimiser l'image pour réduire sa taille
              const optimizedData = await optimizeImage(e.target.result, 1800);
              
              if (!isValidDataUrl(optimizedData)) {
                throw new Error("Données d'image optimisée invalides");
              }
              
              setSelectedFile(file);
              setFileDataUrl(optimizedData);
              setIsNamingDialogOpen(true);
              
              toast.dismiss(loadingToast);
              toast.success("Image optimisée pour de meilleures performances");
            } catch (err) {
              console.error("Erreur lors de l'optimisation:", err);
              toast.dismiss(loadingToast);
              toast.error("Impossible de traiter l'image. Essayez une image plus petite.");
              
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }
          } else {
            toast.dismiss(loadingToast);
            toast.error("Erreur lors de la lecture du fichier");
          }
        };
        
        reader.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture du fichier");
        };
        
        reader.readAsDataURL(file);
      } else {
        // Pour les PDF et petites images, lecture standard
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            const dataUrl = e.target.result;
            
            if (!isValidDataUrl(dataUrl)) {
              toast.dismiss(loadingToast);
              toast.error("Le fichier n'a pas pu être correctement chargé");
              return;
            }
            
            setSelectedFile(file);
            setFileDataUrl(dataUrl);
            setIsNamingDialogOpen(true);
            
            toast.dismiss(loadingToast);
          } else {
            toast.dismiss(loadingToast);
            toast.error("Erreur lors de la lecture du fichier");
          }
        };
        
        reader.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture du fichier");
        };
        
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Erreur lors du traitement du fichier:", error);
      toast.dismiss(loadingToast);
      toast.error("Échec du traitement du fichier");
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDocumentNameConfirmed = (documentName: string) => {
    if (fileDataUrl && isValidDataUrl(fileDataUrl)) {
      console.log("Nom confirmé:", documentName);
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
    } else {
      toast.error("Le fichier n'a pas pu être correctement chargé");
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

  // Fonction pour optimiser les images - version améliorée avec gestion d'erreurs
  const optimizeImage = (dataUrl: string, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Créer une image pour obtenir les dimensions
      const img = new Image();
      
      // Définir un timeout pour éviter un blocage
      const timeout = setTimeout(() => {
        reject(new Error("Délai dépassé lors du chargement de l'image"));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
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
          
          // Convertir en JPEG avec une qualité réduite (70%)
          const optimizedUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(optimizedUrl);
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Erreur lors du chargement de l'image"));
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
