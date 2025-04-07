import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Annotation, Document } from '@/components/annotations/types';
import { MessageSquare, ExternalLink, Check } from 'lucide-react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnnotationsTableProps {
  documents?: Document[];
  annotations?: Annotation[];
  projectId: string;
  onSelectAnnotation?: (annotation: Annotation) => void;
  onSelectAnnotations?: (annotations: Annotation[]) => void;
  showSelectButton?: boolean;
}

export const AnnotationsTable: React.FC<AnnotationsTableProps> = ({ 
  documents, 
  annotations, 
  projectId,
  onSelectAnnotation,
  onSelectAnnotations,
  showSelectButton = false
}) => {
  const navigate = useNavigate();
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  
  // Extraire toutes les annotations, soit directement des props, soit des documents
  const allAnnotations = annotations || 
    (documents ? documents.flatMap(doc => 
      doc?.annotations?.map(ann => ({
        ...ann,
        documentId: doc.id,
        documentName: doc.name
      })) || []
    ) : []);
  
  // Trier les annotations par ordre de création
  const sortedAnnotations = [...allAnnotations].sort((a, b) => {
    const dateA = a.createdAt || a.date || '';
    const dateB = b.createdAt || b.date || '';
    return dateA.localeCompare(dateB);
  });
  
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
  
  const handleToggleAnnotation = (annotationId: string) => {
    setSelectedAnnotations(prev => {
      if (prev.includes(annotationId)) {
        return prev.filter(id => id !== annotationId);
      } else {
        return [...prev, annotationId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedAnnotations.length === sortedAnnotations.length) {
      setSelectedAnnotations([]);
    } else {
      setSelectedAnnotations(sortedAnnotations.map(a => a.id));
    }
  };
  
  const handleImportSelected = () => {
    if (onSelectAnnotations && selectedAnnotations.length > 0) {
      const annotationsToImport = sortedAnnotations.filter(a => 
        selectedAnnotations.includes(a.id)
      );
      onSelectAnnotations(annotationsToImport);
    }
  };

  // Regrouper les annotations par document
  const annotationsByDocument = React.useMemo(() => {
    const grouped: Record<string, { document: string, annotations: Annotation[] }> = {};
    
    sortedAnnotations.forEach(annotation => {
      const documentId = annotation.documentId;
      const documentName = annotation.documentName || "Document sans nom";
      
      if (!grouped[documentId]) {
        grouped[documentId] = {
          document: documentName,
          annotations: []
        };
      }
      
      grouped[documentId].annotations.push(annotation);
    });
    
    return grouped;
  }, [sortedAnnotations]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {sortedAnnotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            Aucune annotation n'a été trouvée.
          </p>
          <Button onClick={handleViewAnnotations}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Ajouter des annotations
          </Button>
        </div>
      ) : (
        <>
          {showSelectButton && (
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectedAnnotations.length === sortedAnnotations.length && sortedAnnotations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Sélectionner tout ({selectedAnnotations.length}/{sortedAnnotations.length})
                </label>
              </div>
              <Button 
                size="sm" 
                onClick={handleImportSelected}
                disabled={selectedAnnotations.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Importer la sélection
              </Button>
            </div>
          )}
        
          {Object.entries(annotationsByDocument).map(([documentId, group]) => (
            <div key={documentId} className="mb-4">
              <div className="bg-muted px-4 py-2 font-medium">
                {group.document}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {showSelectButton && <TableHead className="w-10"></TableHead>}
                    <TableHead className="w-10">ID</TableHead>
                    <TableHead className="w-10">N°</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    {showSelectButton && <TableHead className="w-20"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.annotations.map((annotation, index) => (
                    <TableRow key={annotation.id}>
                      {showSelectButton && (
                        <TableCell>
                          <Checkbox 
                            checked={selectedAnnotations.includes(annotation.id)}
                            onCheckedChange={() => handleToggleAnnotation(annotation.id)}
                          />
                        </TableCell>
                      )}
                      {/* Colonne ID - afficher seulement les 4 derniers caractères */}
                      <TableCell className="font-medium">
                        #{annotation.id.substring(annotation.id.length - 4)}
                      </TableCell>
                      
                      {/* Colonne N° - index incrémental pour ce document */}
                      <TableCell className="text-center">{index + 1}</TableCell>
                      
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
                            onClick={() => onSelectAnnotation && onSelectAnnotation(annotation)}
                          >
                            Ajouter
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
