
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, FileUp } from "lucide-react";
import { SiteVisitReportUploader } from "@/components/project/SiteVisitReportUploader";
import { toast } from "sonner";

interface PhotosSectionProps {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
}

export const PhotosSection = ({ photos, setPhotos }: PhotosSectionProps) => {
  const handleAddPhoto = (url: string) => {
    setPhotos((prevPhotos) => [...prevPhotos, url]);
    toast.success("Photo ajoutée avec succès");
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    toast.success("Photo supprimée");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Photos du site</CardTitle>
            <CardDescription>État du chantier et progression</CardDescription>
          </div>
          <SiteVisitReportUploader
            onFileUploaded={handleAddPhoto}
            type="image"
            multiple
            variant="button"
            className="h-9"
            text="Ajouter photos"
            icon={<ImagePlus className="mr-2 h-4 w-4" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">Aucune photo ajoutée</p>
            <SiteVisitReportUploader
              onFileUploaded={handleAddPhoto}
              type="image"
              multiple
              accept="image/*"
              variant="button"
              text="Parcourir des images"
              icon={<FileUp className="mr-2 h-4 w-4" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-48 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-0 md:opacity-0 opacity-100"
                  onClick={() => removePhoto(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
