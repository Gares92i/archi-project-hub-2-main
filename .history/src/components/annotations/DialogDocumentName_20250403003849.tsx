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

  // Mettre à jour le nom quand defaultName change
  useEffect(() => {
    setDocumentName(defaultName || "");
  }, [defaultName, isOpen]);

  const handleSubmit = () => {
    if (documentName.trim()) {
      onSave(documentName);
      onClose();
      setDocumentName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nom du document</DialogTitle>
          <DialogDescription>Entrez un nom pour ce document</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Nom du document"
            className="w-full"
            autoFocus
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
