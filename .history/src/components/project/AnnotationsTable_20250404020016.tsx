
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Annotation } from '@/components/annotations/types';

interface AnnotationsTableProps {
  annotations: Annotation[];
  projectId: string;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({ annotations, projectId }) => {
  const navigate = useNavigate();

  const handleViewAnnotations = () => {
    navigate(`/projects/${projectId}/annotations`);
  };

  // Pour formater la date des annotations
  const formatDate = (dateString: string) => {
    if (dateString.includes('Il y a')) {
      return dateString; // Déjà formatée
    }
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {annotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Aucune annotation n'a été ajoutée à ce projet.
          </p>
          <Button onClick={handleViewAnnotations}>
            Ajouter des annotations
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {annotations.slice(0, 5).map((annotation) => (
              <TableRow key={annotation.id}>
                <TableCell className="font-medium">{annotation.id}</TableCell>
                <TableCell className="max-w-xs truncate">{annotation.comment}</TableCell>
                <TableCell>{annotation.author}</TableCell>
                <TableCell>{formatDate(annotation.date)}</TableCell>
                <TableCell>
                  <Badge variant={annotation.isResolved ? "success" : "outline"}>
                    {annotation.isResolved ? "Résolu" : "En cours"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewAnnotations}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {annotations.length > 5 && (
        <div className="p-4 text-center border-t">
          <Button variant="outline" size="sm" onClick={handleViewAnnotations}>
            Voir toutes les annotations ({annotations.length})
          </Button>
        </div>
      )}
    </div>
  );
};
