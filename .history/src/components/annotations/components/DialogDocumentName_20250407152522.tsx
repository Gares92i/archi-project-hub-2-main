import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DialogDocumentNameProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentName: string) => void;
  defaultName: string;
}

export const DialogDocumentName: React.FC<DialogDocumentNameProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName,
}) => {
  const [documentName, setDocumentName] = useState("");

  // Réinitialiser le nom quand le dialogue s'ouvre avec un nouveau nom par défaut
  useEffect(() => {
    if (isOpen && defaultName) {
      setDocumentName(defaultName);
    }
  }, [isOpen, defaultName]);

  const handleSave = () => {
    if (documentName.trim()) {
      onSave(documentName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nommer le document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="documentName">Nom du document</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Entrez un nom pour ce document"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={!documentName.trim()}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
