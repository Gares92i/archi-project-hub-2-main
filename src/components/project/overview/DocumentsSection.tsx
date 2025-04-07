
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Document } from "@/components/DocumentsList";

interface DocumentsSectionProps {
  projectDocuments: Document[];
  formatDate: (dateString: string) => string;
}

export const DocumentsSection = ({ 
  projectDocuments,
  formatDate
}: DocumentsSectionProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Documents récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projectDocuments.slice(0, 3).map(doc => (
            <div key={doc.id} className="flex items-center gap-3 border rounded-md p-2">
              <div className={`p-2 rounded-md ${
                doc.type === 'pdf' ? 'bg-red-100 text-red-700' :
                doc.type === 'xls' ? 'bg-green-100 text-green-700' : 
                doc.type === 'img' ? 'bg-blue-100 text-blue-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.size} • {formatDate(doc.date!)}</p>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full">
            Voir tous les documents ({projectDocuments.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
