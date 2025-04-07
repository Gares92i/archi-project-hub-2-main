
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Layout, CheckCircle2 } from "lucide-react";

// Types de modèles disponibles
export const reportTemplates = [
  {
    id: "standard",
    name: "Rapport standard",
    description: "Modèle complet avec observations, recommandations et photos",
    icon: FileText,
    fields: ["observations", "recommendations", "photos", "signatures"]
  },
  {
    id: "simple",
    name: "Rapport simplifié",
    description: "Modèle simplifié avec observations uniquement",
    icon: Layout,
    fields: ["observations", "photos"]
  },
  {
    id: "detailed",
    name: "Rapport détaillé",
    description: "Modèle détaillé avec tous les éléments et documents attachés",
    icon: FileText,
    fields: ["observations", "recommendations", "photos", "signatures", "documents", "additionalDetails"]
  }
];

interface ReportTemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export function ReportTemplateSelector({ selectedTemplate, onSelectTemplate }: ReportTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedTemplateName = reportTemplates.find(t => t.id === selectedTemplate)?.name || "Choisir un modèle";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          <Layout className="mr-2 h-4 w-4" />
          {selectedTemplateName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Choisir un modèle de rapport</DialogTitle>
          <DialogDescription>
            Sélectionnez un modèle prédéfini pour votre rapport de visite
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {reportTemplates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer relative ${isSelected ? 'border-primary' : 'hover:border-muted-foreground/20'}`}
                onClick={() => {
                  onSelectTemplate(template.id);
                  setOpen(false);
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <CardHeader className="py-4">
                  <template.icon className="h-8 w-8 text-primary/80 mb-2" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardContent>
                <CardFooter className="pt-4 pb-3">
                  <Button 
                    variant={isSelected ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                  >
                    {isSelected ? "Sélectionné" : "Choisir"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
