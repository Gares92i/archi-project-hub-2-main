
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteVisitReportUploader } from "@/components/project/SiteVisitReportUploader";

interface ProjectImageCardProps {
  imageUrl?: string;
  projectName: string;
  onImageUploaded: (url: string) => void;
}

export const ProjectImageCard = ({ imageUrl, projectName, onImageUploaded }: ProjectImageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image du projet</CardTitle>
        <CardDescription>Ajoutez ou modifiez l'image du projet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {imageUrl && (
            <div className="border rounded-md overflow-hidden">
              <img 
                src={imageUrl} 
                alt={projectName} 
                className="w-full h-40 object-cover"
              />
            </div>
          )}
          <SiteVisitReportUploader
            onFileUploaded={onImageUploaded}
            type="image"
            displayPreview={true}
            accept="image/*"
          />
          <p className="text-xs text-muted-foreground">
            Format recommandé: JPG ou PNG, taille max: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
