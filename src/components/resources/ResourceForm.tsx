
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ResourceFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddResource: () => void;
}

export const ResourceForm = ({ isOpen, onOpenChange, onAddResource }: ResourceFormProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Ajouter une ressource</SheetTitle>
          <SheetDescription>
            Ajoutez une nouvelle ressource à partager avec l'équipe.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-name">Nom de la ressource</Label>
            <Input id="resource-name" placeholder="Entrez le nom de la ressource" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-type">Type</Label>
            <Select>
              <SelectTrigger id="resource-type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-category">Catégorie</Label>
            <Select>
              <SelectTrigger id="resource-category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="templates">Templates</SelectItem>
                <SelectItem value="standards">Normes</SelectItem>
                <SelectItem value="materials">Matériaux</SelectItem>
                <SelectItem value="tutorials">Tutoriels</SelectItem>
                <SelectItem value="software">Logiciels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-file">Fichier</Label>
            <Input id="resource-file" type="file" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource-description">Description (optionnelle)</Label>
            <Input id="resource-description" placeholder="Description de la ressource" />
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onAddResource}>Ajouter la ressource</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
