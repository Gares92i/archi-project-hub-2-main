import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Annotation } from "@/components/annotations/types";
import { AnnotationReserve } from "@/hooks/use-report-form";
import { AnnotationReserveItem } from "./AnnotationReserveItem";
import { AnnotationsTable } from "./AnnotationsTable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReportAnnotationsSectionProps {
  reserves: AnnotationReserve[];
  setReserves: React.Dispatch<React.SetStateAction<AnnotationReserve[]>>;
  annotations: Annotation[];
  projectId: string;
}

export const ReportAnnotationsSection: React.FC<ReportAnnotationsSectionProps> = ({
  reserves,
  setReserves,
  annotations,
  projectId,
}) => {
  const [isAnnotationsDialogOpen, setIsAnnotationsDialogOpen] = useState(false);
  const [filterResolved, setFilterResolved] = useState(true);

  // Log pour déboguer les annotations
  useEffect(() => {
    console.log("Annotations disponibles:", annotations);
    console.log("Annotations avec lot:", annotations.filter(a => a.lot));
    console.log("Annotations avec localisation:", annotations.filter(a => a.location));
  }, [annotations]);

  // Filtrer les annotations résolues ou non
  const filteredAnnotations = filterResolved
    ? annotations.filter(a => !a.resolved && !a.isResolved)
    : annotations;

  const updateReserve = (id: string, data: Partial<AnnotationReserve>) => {
    setReserves(reserves.map(reserve =>
      reserve.id === id ? { ...reserve, ...data } : reserve
    ));
  };

  const removeReserve = (id: string) => {
    setReserves(reserves.filter(reserve => reserve.id !== id));
  };

  const addReserveFromAnnotation = (annotation: Annotation) => {
    console.log("Ajout de réserve depuis annotation:", annotation);
    const newReserve: AnnotationReserve = {
      id: `reserve-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      annotationId: annotation.id,
      lot: annotation.lot || "Non spécifié",
      location: annotation.location || "Non spécifiée",
      description: annotation.comment || "Sans description",
      createdAt: annotation.createdAt || new Date().toISOString(),
      resolvedAt: annotation.resolvedDate,
      status: (annotation.resolved || annotation.isResolved) ? "resolved" : "pending",
      photos: annotation.photos || [],
    };

    console.log("Nouvelle réserve créée:", newReserve);
    setReserves(prev => [...prev, newReserve]);
  };

  const addMultipleReservesFromAnnotations = (selectedAnnotations: Annotation[]) => {
    console.log("Ajout multiple de réserves:", selectedAnnotations);

    const newReserves = selectedAnnotations.map(annotation => ({
      id: `reserve-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      annotationId: annotation.id,
      lot: annotation.lot || "Non spécifié",
      location: annotation.location || "Non spécifiée",
      description: annotation.comment || "Sans description",
      createdAt: annotation.createdAt || new Date().toISOString(),
      resolvedAt: annotation.resolvedDate,
      status: (annotation.resolved || annotation.isResolved) ? "resolved" : "pending",
      photos: annotation.photos || [],
    }));

    console.log("Nouvelles réserves créées:", newReserves);
    setReserves(prev => [...prev, ...newReserves]);
    setIsAnnotationsDialogOpen(false);
  };

  // Regrouper les réserves par document
  const reservesByDocument = React.useMemo(() => {
    const grouped: Record<string, { document: string; reserves: AnnotationReserve[] }> = {};

    reserves.forEach((reserve) => {
      const documentId = reserve.annotationId || "unknown";
      const documentName = reserve.lot || "Document sans nom";

      if (!grouped[documentId]) {
        grouped[documentId] = {
          document: documentName,
          reserves: [],
        };
      }

      grouped[documentId].reserves.push(reserve);
    });

    return grouped;
  }, [reserves]);

  const addEmptyReserve = () => {
    const newReserve: AnnotationReserve = {
      id: `reserve-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      lot: "",
      location: "",
      description: "",
      createdAt: new Date().toISOString(),
      status: "pending",
      photos: [],
    };

    setReserves([...reserves, newReserve]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Réserves & Annotations</CardTitle>
            <CardDescription>Liste des réserves et annotations identifiées sur le chantier</CardDescription>
          </div>
          <Button onClick={addEmptyReserve}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une réserve
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.entries(reservesByDocument).map(([documentId, group]) => (
          <div key={documentId} className="mb-4">
            <div className="bg-muted px-4 py-2 font-medium">{group.document}</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">N°</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Levée le</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.reserves.map((reserve, index) => (
                  <AnnotationReserveItem
                    key={reserve.id}
                    reserve={reserve}
                    updateReserve={(id, data) =>
                      setReserves((prev) =>
                        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
                      )
                    }
                    removeReserve={(id) =>
                      setReserves((prev) => prev.filter((r) => r.id !== id))
                    }
                    index={index + 1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};