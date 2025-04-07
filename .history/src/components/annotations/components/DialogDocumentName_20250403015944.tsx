import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DialogDocumentNameProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
}

export const DialogDocumentName: React.FC<DialogDocumentNameProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName,
}) => {
  const [documentName, setDocumentName] = useState(defaultName);

  const handleSave = () => {
    if (documentName.trim() === "") {
      setDocumentName(defaultName); // Revenir au nom par défaut si vide
      onSave(defaultName);
    } else {
      onSave(documentName);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nommer le document</DialogTitle>
          <DialogDescription>
            Veuillez donner un nom à ce document pour faciliter son
            identification.
          </DialogDescription>
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
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
