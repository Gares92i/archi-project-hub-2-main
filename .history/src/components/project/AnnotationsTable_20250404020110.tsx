import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Annotation, Document } from '@/components/annotations/types';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface AnnotationsTableProps {
  documents: Document[];
  projectId: string;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({ documents, projectId }) => {
  const navigate = useNavigate();
  
  // Extraire toutes les annotations de tous les documents
  const annotations = documents.flatMap(doc => 
    doc.annotations.map(ann => ({
      ...ann,
      documentId: doc.id,
      documentName: doc.name
    }))
  );
  
  const handleViewAnnotations = () => {
    navigate(`/project/${projectId}/annotations`);
  };
  
  // Pour formater la date des annotations
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
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

  const handleViewAnnotation = (documentId: string, annotationId: string) => {
    navigate(`/project/${projectId}/annotations?documentId=${documentId}&annotationId=${annotationId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {annotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Aucune annotation n'a été ajoutée à ce projet.
          </p>
          <Button onClick={handleViewAnnotations}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Ajouter des annotations
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {annotations.slice(0, 5).map((annotation) => (
              <TableRow key={annotation.id}>
                <TableCell className="font-medium">#{annotation.id.slice(-4)}</TableCell>
                <TableCell>{annotation.documentName || "Document inconnu"}</TableCell>
                <TableCell className="max-w-xs truncate">{annotation.comment || "Aucun commentaire"}</TableCell>
                <TableCell>{formatDate(annotation.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={annotation.resolved ? "success" : "outline"}>
                    {annotation.resolved ? "Résolu" : "En cours"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewAnnotation(annotation.documentId, annotation.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
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
