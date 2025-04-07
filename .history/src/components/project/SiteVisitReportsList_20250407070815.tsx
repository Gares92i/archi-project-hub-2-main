
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  User, 
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getAllReportsByProjectId } from "@/components/services/reportService";
import { SiteVisitReport } from "@/components/services/types";
import { toast } from "sonner";

interface SiteVisitReportsListProps {
  formatDate: (dateString: string) => string;
}

export const SiteVisitReportsList = ({ formatDate }: SiteVisitReportsListProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reports, setReports] = useState<SiteVisitReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projectReports = await getAllReportsByProjectId(id);
        setReports(projectReports);
      } catch (error) {
        console.error("Erreur lors du chargement des rapports:", error);
        toast.error("Erreur lors du chargement des rapports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h3 className="font-medium text-lg">Aucun compte rendu</h3>
        <p className="text-muted-foreground">
          Aucun compte rendu de visite n'a encore été créé pour ce projet.
        </p>
        <Button 
          onClick={() => navigate(`/projects/${id}/report/new`)}
          className="mt-2"
        >
          Créer un compte rendu
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date de visite</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Progression</TableHead>
          <TableHead>Observations</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {formatDate(report.visitDate)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {report.inCharge}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={
                report.progress < 30 ? "bg-red-500" : 
                report.progress < 70 ? "bg-yellow-500" : 
                "bg-green-500"
              }>
                {report.progress}%
              </Badge>
            </TableCell>
            <TableCell className="max-w-md truncate">
              {report.observations.length} observation(s)
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/projects/${id}/report/${report.id}`)}>
                    Voir le détail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/projects/${id}/report/${report.id}/edit`)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.print()}>
                    Imprimer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Rapport envoyé au client par email")}>
                    Envoyer par email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
