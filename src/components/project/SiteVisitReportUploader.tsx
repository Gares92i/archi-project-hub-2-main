import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUp, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { toast } from "sonner";

type SiteVisitReportUploaderProps = {
  onFileUploaded: (url: string) => void;
  type?: "image" | "document" | "signature";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | "button";
  accept?: string;
  multiple?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  text?: string;
  icon?: React.ReactNode;
  className?: string;
  displayPreview?: boolean;
};

export function SiteVisitReportUploader({
  onFileUploaded,
  type = "image",
  variant = "default",
  accept,
  multiple = false,
  size = "default",
  text,
  icon,
  className,
  displayPreview = false,
}: SiteVisitReportUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (type) {
      case "image":
        return "image/*";
      case "document":
        return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
      case "signature":
        return "image/png,image/jpeg";
      default:
        return "";
    }
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    console.log("Fichier sélectionné:", files[0].name, "Type:", files[0].type); // Ajout de log
    
    setUploading(true);
    const loadingToast = toast.loading(`Téléchargement en cours...`);
    
    try {
      const file = files[0];
      
      // Vérifier le type de fichier
      if (type === "image" || type === "signature") {
        if (!file.type.startsWith("image/")) {
          console.error("Type de fichier invalide:", file.type); // Ajout de log
          toast.dismiss(loadingToast);
          toast.error("Veuillez sélectionner un fichier image");
          setUploading(false);
          return;
        }
      }
      
      // Lire le fichier comme Data URL (base64)
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const dataUrl = event.target.result as string;
          
          // Log pour déboguer
          console.log("Image convertie en Data URL (premiers 50 caractères):", dataUrl.substring(0, 50) + "..."); // Ajout de log
          
          // Générer la prévisualisation si demandé
          if ((type === "image" || type === "signature") && displayPreview) {
            setPreview(dataUrl);
          }
          
          // Envoyer les données réelles au callback
          console.log("Appel de onFileUploaded avec les données"); // Ajout de log
          onFileUploaded(dataUrl);
          
          toast.dismiss(loadingToast);
          toast.success(`Fichier "${file.name}" téléchargé avec succès`);
        } else {
          console.error("Résultat de lecture null ou undefined"); // Ajout de log
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture du fichier");
        }
        setUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error("Erreur FileReader:", error); // Ajout de log
        toast.dismiss(loadingToast);
        toast.error(`Erreur lors de la lecture du fichier "${file.name}"`);
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.dismiss(loadingToast);
      toast.error("Erreur lors du téléchargement du fichier");
      setUploading(false);
    } finally {
      // Reset the input
      e.target.value = "";
    }
  }, [onFileUploaded, type, displayPreview]);

  // Optimize mobile photo capture
  const capturePhoto = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // Correction de la propriété capture
    input.setAttribute('capture', 'environment');
    input.addEventListener('change', (e) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>));
    input.click();
  }, [handleFileChange]);

  const renderButton = () => {
    if (variant === "button") {
      return (
        <Button 
          type="button"
          size={size}
          className={className}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              {icon || <FileUp className="mr-2 h-4 w-4" />}
              {text || "Télécharger"}
            </>
          )}
        </Button>
      );
    }

    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg",
          "hover:border-primary cursor-pointer transition-colors",
          className
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">Téléchargement en cours...</p>
          </>
        ) : preview ? (
          <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
            <img 
              src={preview} 
              alt="Prévisualisation" 
              className="max-w-full max-h-[200px] object-contain rounded-md" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <p className="text-white text-sm">Cliquer pour changer</p>
            </div>
          </div>
        ) : (
          <>
            {icon || (type === "image" ? <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" /> : <FileUp className="h-8 w-8 text-muted-foreground mb-2" />)}
            <p className="text-sm text-muted-foreground">
              {text || `Glissez-déposez un fichier ${type === "image" ? "image" : "document"} ou cliquez pour parcourir`}
            </p>
            {type === "image" && (
              <div className="flex gap-2 mt-3">
                <Button type="button" variant="outline" size="sm" onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Prendre une photo
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <label className={cn("cursor-pointer block", uploading && "pointer-events-none")}>
      <input
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
        disabled={uploading}
      />
      {renderButton()}
    </label>
  );
}
