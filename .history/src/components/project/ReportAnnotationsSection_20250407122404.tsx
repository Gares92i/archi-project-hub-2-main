import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Annotation } from "@/components/annotations/types";
import { AnnotationReserveItem } from "./AnnotationReserveItem";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnotationReserve {
  id: string;
  annotationId?: string;
  lot: string;
  location: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
  status: "pending" | "resolved";
  photos?: string[];
  responsable?: string;
}

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

  // Filtrer les annotations résolues ou non
  const filteredAnnotations = filterResolved 
    ? annotations.filter(a => !a.resolved && !a.isResolved)
    : annotations;
    
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
  };

  const updateReserve = (id: string, data: Partial<AnnotationReserve>) => {
    setReserves(reserves.map(reserve => 
      reserve.id === id ? { ...reserve, ...data } : reserve
    ));
  };

  const removeReserve = (id: string) => {
    setReserves(reserves.filter(reserve => reserve.id !== id));
  };

  const addReserveFromAnnotation = (annotation: Annotation) => {
    const newReserve: AnnotationReserve = {
      id: `reserve-${Date.now()}`,
      annotationId: annotation.id,
      lot: annotation.lot || "Non spécifié",
      location: annotation.location || "Non spécifiée",
      description: annotation.comment || "Sans description",
      createdAt: annotation.createdAt || new Date().toISOString(),
      resolvedAt: annotation.resolvedDate,
      status: (annotation.resolved || annotation.isResolved) ? "resolved" : "pending",
      photos: annotation.photos || [],
    };

    setReserves([...reserves, newReserve]);
    setIsAnnotationsDialogOpen(false);
  };

  const addEmptyReserve = () => {
    const newReserve: AnnotationReserve = {
      id: `reserve-${Date.now()}`,
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
          <div className="flex gap-2">
            <Dialog open={isAnnotationsDialogOpen} onOpenChange={setIsAnnotationsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Importer des annotations
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sélectionnez des annotations à ajouter</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Annotations disponibles ({filteredAnnotations.length})</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterResolved(!filterResolved)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Filter className="h-3 w-3" />
                      {filterResolved ? "Voir toutes" : "Masquer résolues"}
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Lot</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Commentaire</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnnotations.length === 0 ? (
                        <TableRow>
                          <td colSpan={7} className="text-center py-4 text-muted-foreground">
                            Aucune annotation disponible
                          </td>
                        </TableRow>
                      ) : (
                        filteredAnnotations.map(annotation => (
                          <TableRow key={annotation.id}>
                            <td>{annotation.documentName || "Document"}</td>
                            <td>{annotation.lot || "-"}</td>
                            <td>{annotation.location || "-"}</td>
                            <td className="max-w-xs truncate">{annotation.comment || "-"}</td>
                            <td>{formatDate(annotation.createdAt || annotation.date)}</td>
                            <td>
                              <Badge variant={(annotation.resolved || annotation.isResolved) ? "success" : "outline"}>
                                {(annotation.resolved || annotation.isResolved) ? "Résolu" : "En cours"}
                              </Badge>
                            </td>
                            <td>
                              <Button 
                                size="sm"
                                onClick={() => addReserveFromAnnotation(annotation)}
                              >
                                Ajouter
                              </Button>
                            </td>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={addEmptyReserve}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une réserve
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reserves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aucune réserve ajoutée</p>
            <Button type="button" className="mt-4" onClick={addEmptyReserve}>
              Ajouter une réserve
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                {reserves.map((reserve) => (
                  <AnnotationReserveItem 
                    key={reserve.id}
                    reserve={reserve}
                    updateReserve={updateReserve}
                    removeReserve={removeReserve}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};