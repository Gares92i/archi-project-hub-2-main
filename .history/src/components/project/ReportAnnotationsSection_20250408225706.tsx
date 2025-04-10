import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Annotation } from "@/components/annotations/types";
import { AnnotationReserve } from "@/hooks/use-report-form";
import { AnnotationReserveItem } from "@/components/project/AnnotationReserveItem";
import { AnnotationsTable } from "@/components/project/AnnotationsTable";

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
                    <h3 className="text-sm font-medium">
                      Annotations disponibles ({filteredAnnotations.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filterResolved" 
                        checked={filterResolved}
                        onCheckedChange={(checked) => setFilterResolved(!!checked)}
                      />
                      <label htmlFor="filterResolved" className="text-sm">
                        Masquer les annotations résolues
                      </label>
                    </div>
                  </div>
                  
                  <AnnotationsTable
                    annotations={filteredAnnotations}
                    projectId={projectId}
                    onSelectAnnotation={addReserveFromAnnotation}
                    onSelectAnnotations={addMultipleReservesFromAnnotations}
                    showSelectButton={true}
                  />
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
          <div>
            {/* Style similaire à la section Participants */}
            <div
              className="participants-bar"
              style={{
                backgroundColor: "#f4f4f9",
                padding: "15px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ccc",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
            >
              <span
                className="title"
                style={{
                  color: "#007bff",
                  fontWeight: "bold",
                  fontSize: "16px",
                  textTransform: "none",
                }}
              >
                Réserves ({reserves.length})
              </span>

              <div
                className="status-group"
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                <span
                  className="status pending"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "bold",
                    color: "#fd7e14",
                  }}
                >
                  <span
                    className="letter"
                    style={{
                      display: "inline-block",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      textAlign: "center",
                      lineHeight: "20px",
                      marginRight: "6px",
                      fontWeight: "bold",
                      border: "2px solid #fd7e14",
                      color: "#fd7e14",
                    }}
                  >
                    P
                  </span>{" "}
                  En cours
                </span>
                <span
                  className="status resolved"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  <span
                    className="letter"
                    style={{
                      display: "inline-block",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      textAlign: "center",
                      lineHeight: "20px",
                      marginRight: "6px",
                      fontWeight: "bold",
                      border: "2px solid #28a745",
                      color: "#28a745",
                    }}
                  >
                    R
                  </span>{" "}
                  Résolue
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {reserves.map((reserve, index) => (
                <div 
                  key={reserve.id} 
                  className="bg-white border rounded-lg p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap gap-4">
                    {/* Numéro avec cercle comme dans AnnotationMarker */}
                    <div className="flex items-center justify-center">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center
                                  border-2 border-orange-500 bg-orange-100 text-orange-800"
                      >
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>

                    <AnnotationReserveItem
                      reserve={reserve}
                      updateReserve={updateReserve}
                      removeReserve={removeReserve}
                      index={index + 1}
                      displayAsCard={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};