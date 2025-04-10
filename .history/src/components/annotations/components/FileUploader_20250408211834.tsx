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
  const [newDocumentName, setNewDocumentName] = useState("");
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
              setSelectedFile(file);
              setFileDataUrl(optimizedUrl);

              // Ouvrir le dialogue et vérifier que ça fonctionne
              console.log("Ouverture du dialogue de nommage", { isNamingDialogOpen: true });
              setIsNamingDialogOpen(true);
              
              toast.dismiss(loadingToast);
              toast.success("Image optimisée pour de meilleures performances");
            } catch (err) {
              console.error("Erreur lors de l'optimisation:", err);
              // En cas d'erreur, utiliser l'image originale
              setSelectedFile(file);
              setFileDataUrl(dataUrl);
              setIsNamingDialogOpen(true);
              
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
            setSelectedFile(file);
            setFileDataUrl(dataUrl);

            // Ouvrir le dialogue et vérifier que ça fonctionne
            console.log("Ouverture du dialogue de nommage", {
              isNamingDialogOpen: true,
            });
            setIsNamingDialogOpen(true);
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
    if (fileDataUrl) {
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
    }
  };

  const handleDialogClosed = () => {
    console.log("Dialogue fermé");
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

      {isNamingDialogOpen && (
        <DialogDocumentName
          isOpen={isNamingDialogOpen}
          onClose={() => setIsNamingDialogOpen(false)}
          onNameChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setNewDocumentName(event.target.value)
          } // Ensure this prop exists in DialogDocumentNameProps or remove it
          onNameSave={handleDocumentNameSave}
          defaultName={selectedFile?.name}
        />
      )}
    </>
  );
};
