import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface PhotosSectionProps {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PhotosSection = ({ photos, setPhotos }: PhotosSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const loadingToast = toast.loading(`Téléchargement de ${files.length} image(s)...`);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`Le fichier "${file.name}" n'est pas une image valide`);
        }
        
        // Créer un URL temporaire pour l'aperçu du fichier
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error(`Échec du téléchargement de "${file.name}"`));
            }
          };
          reader.onerror = () => reject(new Error(`Échec du téléchargement de "${file.name}"`));
          reader.readAsDataURL(file);
        });
      });

      const newImages = await Promise.all(uploadPromises);
      setPhotos([...photos, ...newImages]);
      toast.dismiss(loadingToast);
      toast.success(`${newImages.length} image(s) téléchargée(s) avec succès`);
    } catch (error) {
      console.error("Erreur lors du téléchargement des images:", error);
      toast.dismiss(loadingToast);
      toast.error("Échec du téléchargement de certaines images");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    toast.success("Image supprimée");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Photos du site</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={handleUploadClick} 
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Téléchargement en cours..." : "Télécharger des images"}
          </Button>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group rounded-md overflow-hidden border">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-36 object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucune photo ajoutée</p>
            <p className="text-sm">Téléchargez des photos pour illustrer votre rapport</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
