import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Upload, Calendar as CalendarIcon, X, Image } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnnotationReserve } from "@/hooks/use-report-form";

interface AnnotationReserveItemProps {
  reserve: AnnotationReserve;
  updateReserve: (id: string, data: Partial<AnnotationReserve>) => void;
  removeReserve: (id: string) => void;
}

// Liste des lots (à remplacer par une vraie liste si nécessaire)
const lots = [
  "Gros œuvre",
  "Charpente",
  "Couverture",
  "Menuiserie ext.",
  "Menuiserie int.",
  "Plomberie",
  "Électricité",
  "Peinture",
  "Carrelage",
  "Isolation",
  "VRD",
  "Autre"
];

export const AnnotationReserveItem: React.FC<AnnotationReserveItemProps> = ({
  reserve,
  updateReserve,
  removeReserve
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    
    setIsUploading(true);
    const loadingToast = toast.loading(`Téléchargement de ${file.name} en cours...`);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const photos = reserve.photos || [];
          updateReserve(reserve.id, { photos: [...photos, e.target.result as string] });
          toast.dismiss(loadingToast);
          toast.success("Image téléchargée avec succès");
        } else {
          toast.dismiss(loadingToast);
          toast.error("Erreur lors de la lecture de l'image");
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Erreur lors du téléchargement de l'image");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.dismiss(loadingToast);
      toast.error("Erreur lors du téléchargement de l'image");
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (!reserve.photos) return;
    const newPhotos = [...reserve.photos];
    newPhotos.splice(index, 1);
    updateReserve(reserve.id, { photos: newPhotos });
    toast.success("Photo supprimée");
  };

  const handlePreviewPhoto = (url: string) => {
    setPreviewImage(url);
    setIsPreviewOpen(true);
  };

  return (
    <TableRow>
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell>
        <Select
          value={reserve.lot}
          onValueChange={(value) => updateReserve(reserve.id, { lot: value })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sélectionner un lot" />
          </SelectTrigger>
          <SelectContent>
            {lots.map((lot) => (
              <SelectItem key={lot} value={lot}>
                {lot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={reserve.location}
          onChange={(e) =>
            updateReserve(reserve.id, { location: e.target.value })
          }
          placeholder="Localisation"
        />
      </TableCell>
      <TableCell>
        <Input
          value={reserve.description}
          onChange={(e) =>
            updateReserve(reserve.id, { description: e.target.value })
          }
          placeholder="Description du problème"
        />
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(reserve.createdAt)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                reserve.createdAt ? new Date(reserve.createdAt) : undefined
              }
              onSelect={(date) =>
                date &&
                updateReserve(reserve.id, { createdAt: date.toISOString() })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[150px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {reserve.resolvedAt
                ? formatDate(reserve.resolvedAt)
                : "Non résolue"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                reserve.resolvedAt ? new Date(reserve.resolvedAt) : undefined
              }
              onSelect={(date) => {
                if (date) {
                  updateReserve(reserve.id, {
                    resolvedAt: date.toISOString(),
                    status: "resolved",
                  });
                } else {
                  updateReserve(reserve.id, {
                    resolvedAt: undefined,
                    status: "pending",
                  });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {reserve.photos && reserve.photos.length > 0 ? (
            <div className="flex gap-1">
              {reserve.photos.map((photo, index) => (
                <div key={index} className="relative group w-10 h-10">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-10 h-10 object-cover rounded-md border cursor-pointer"
                    onClick={() => handlePreviewPhoto(photo)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(index)}>
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}>
                <Image className="mr-2 h-4 w-4" />
                {isUploading ? "..." : "Photo"}
              </Button>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeReserve(reserve.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la photo</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewImage && (
              <img
                src={previewImage}
                alt="Aperçu"
                className="max-h-[70vh] max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
};