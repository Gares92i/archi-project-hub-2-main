import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Image, FileText } from "lucide-react";
import { toast } from "sonner";

interface AddFileButtonProps {
  onDocumentUpdate: (url: string, filename: string) => void;
}

export const AddFileButton: React.FC<AddFileButtonProps> = ({ onDocumentUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Seuls les fichiers images et PDF sont acceptés");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading(`Chargement de ${file.name}...`);

    // Créer un lecteur de fichier pour convertir en Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        onDocumentUpdate(dataUrl, file.name);
        toast.dismiss(loadingToast);
        toast.success(`Fichier ${file.name} ajouté avec succès`);
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error(`Erreur lors du chargement de ${file.name}`);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="text-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*, application/pdf"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-muted/30 rounded-full p-6">
          <FileUp className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Aucun document</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Ajoutez un plan, un PDF ou une image pour commencer à annoter.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Button onClick={handleButtonClick} disabled={isUploading}>
            <Image className="h-4 w-4 mr-2" />
            Ajouter une image
          </Button>
          <Button variant="outline" onClick={handleButtonClick} disabled={isUploading}>
            <FileText className="h-4 w-4 mr-2" />
            Importer un PDF
          </Button>
        </div>
      </div>
    </div>
  );
};