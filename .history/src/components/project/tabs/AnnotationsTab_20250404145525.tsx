import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnnotationsTable } from "@/components/project/AnnotationsTable";
import { Annotation } from "@/components/annotations/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AnnotationsTabProps {
  annotations: Annotation[];
  projectId: string;
}

export const AnnotationsTab = ({ annotations, projectId }: AnnotationsTabProps) => {
  const navigate = useNavigate();

  const handleNavigateToAnnotations = () => {
    navigate(`/projects/${projectId}/annotations`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Annotations de plans</CardTitle>
            <CardDescription>Liste des annotations sur les plans du projet</CardDescription>
          </div>
          <Button onClick={handleNavigateToAnnotations}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle annotation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ErrorBoundary fallback={
          <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
            Une erreur est survenue lors du chargement des annotations.
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Rafraîchir
            </Button>
          </div>
        }>
          <AnnotationsTable 
            annotations={annotations}
            projectId={projectId}
          />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
};
