import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DialogDocumentNameProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
}

export const DialogDocumentName = ({
  isOpen,
  onClose,
  onSave,
  defaultName,
}: DialogDocumentNameProps) => {
  const [documentName, setDocumentName] = useState(defaultName || "");

  // Mettre à jour le nom quand defaultName change ou quand le dialogue s'ouvre
  useEffect(() => {
    if (isOpen) {
      setDocumentName(defaultName || "");
      console.log("DialogDocumentName ouvert avec:", defaultName);
    }
  }, [defaultName, isOpen]);

  const handleSubmit = () => {
    const finalName = documentName.trim() || defaultName || "Document sans nom";
    console.log("Soumission du nom:", finalName);
    onSave(finalName);
    toast.success(`Document "${finalName}" nommé avec succès`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nom du document</DialogTitle>
          <DialogDescription>
            Entrez un nom pour ce document
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            id="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Nom du document"
            className="w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
