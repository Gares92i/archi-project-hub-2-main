
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/components/DocumentsList";

interface DocumentsTabProps {
  projectDocuments: Document[];
  formatDate: (dateString: string) => string;
}

export const DocumentsTab = ({ projectDocuments, formatDate }: DocumentsTabProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Tous les documents liés au projet</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/documents')}>
              Importer
            </Button>
            <Button onClick={() => navigate('/documents')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectDocuments.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      doc.type === 'pdf' ? 'border-red-200 text-red-700 bg-red-50' :
                      doc.type === 'xls' ? 'border-green-200 text-green-700 bg-green-50' :
                      doc.type === 'img' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                      'border-gray-200'
                    }>
                      {doc.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{formatDate(doc.date)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Télécharger</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
