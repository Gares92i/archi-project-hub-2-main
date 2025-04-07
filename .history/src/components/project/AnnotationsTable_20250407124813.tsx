import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Annotation, Document } from '@/components/annotations/types';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnotationsTableProps {
  documents?: Document[];
  annotations?: Annotation[];
  projectId: string;
  onSelectAnnotation: (annotation: Annotation) => void;
  showSelectButton?: boolean;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({ 
  documents, 
  annotations, 
  projectId,
  onSelectAnnotation,
  showSelectButton = false
}) => {
  const navigate = useNavigate();
  
  // Extraire toutes les annotations, soit directement des props, soit des documents
  const allAnnotations = annotations || 
    (documents ? documents.flatMap(doc => 
      doc?.annotations?.map(ann => ({
        ...ann,
        documentId: doc.id,
        documentName: doc.name
      })) || []
    ) : []);
  
  const handleViewAnnotations = () => {
    navigate(`/projects/${projectId}/annotations`);
  };
  
  // Pour formater la date des annotations
  const formatDate = (dateString: string = '') => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const handleViewAnnotation = (documentId: string, annotationId: string) => {
    navigate(`/projects/${projectId}/annotations?documentId=${documentId}&annotationId=${annotationId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {allAnnotations.length === 0 ? (
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
              <TableHead>Document</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              {showSelectButton && <TableHead className="w-20"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAnnotations.map((annotation) => (
              <TableRow key={annotation.id}>
                <TableCell>{annotation.documentName || "Document"}</TableCell>
                <TableCell>{annotation.lot || "-"}</TableCell>
                <TableCell>{annotation.location || "-"}</TableCell>
                <TableCell className="max-w-xs truncate">{annotation.comment || "-"}</TableCell>
                <TableCell>{formatDate(annotation.createdAt || annotation.date || '')}</TableCell>
                <TableCell>
                  <Badge variant={(annotation.resolved || annotation.isResolved) ? "success" : "outline"}>
                    {(annotation.resolved || annotation.isResolved) ? "Résolu" : "En cours"}
                  </Badge>
                </TableCell>
                {showSelectButton && (
                  <TableCell>
                    <Button 
                      size="sm"
                      onClick={() => onSelectAnnotation(annotation)}
                    >
                      Ajouter
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {allAnnotations.length > 5 && (
        <div className="p-4 text-center border-t">
          <Button variant="outline" size="sm" onClick={handleViewAnnotations}>
            Voir toutes les annotations ({allAnnotations.length})
          </Button>
        </div>
      )}
    </div>
  );
};
