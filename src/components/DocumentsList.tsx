import { File, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "img" | "other";
  projectName: string;
  uploadDate: string;
  size: string;
  date?: string; // Optional date property for backward compatibility
  projectId: string; // Added projectId property
}

interface DocumentsListProps {
  documents: Document[];
  title: string;
}

const typeConfig = {
  pdf: { icon: FileText, color: "text-red-500" },
  doc: { icon: FileText, color: "text-blue-500" },
  xls: { icon: FileText, color: "text-green-500" },
  img: { icon: File, color: "text-purple-500" },
  other: { icon: File, color: "text-gray-500" },
};

const DocumentsList = ({ documents, title }: DocumentsListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {documents.map((doc) => {
            const { icon: Icon, color } = typeConfig[doc.type as keyof typeof typeConfig];
            
            return (
              <li key={doc.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className={`flex items-center justify-center w-9 h-9 rounded-md ${color.replace('text-', 'bg-').replace('500', '100')}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium line-clamp-1">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground line-clamp-1">{doc.projectName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{formatDate(doc.uploadDate)}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Télécharger</DropdownMenuItem>
                        <DropdownMenuItem>Renommer</DropdownMenuItem>
                        <DropdownMenuItem>Partager</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </li>
            );
          })}
          {documents.length === 0 && (
            <li className="flex items-center justify-center p-6 text-muted-foreground">
              <p>Aucun document récent</p>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DocumentsList;
