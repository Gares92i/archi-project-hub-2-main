import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CalendarDays, User2, MapPin, FileText } from "lucide-react";
import { ProjectCardProps } from "@/components/ProjectCard";

interface ProjectDetailsCardProps {
  project: ProjectCardProps | null;
  formatDate: (dateString: string) => string;
}

export const ProjectDetailsCard = ({ project, formatDate }: ProjectDetailsCardProps) => {
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du projet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Client</div>
              <div className="text-sm text-muted-foreground">
                {project.client || "Non spécifié"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Période</div>
              <div className="text-sm text-muted-foreground">
                {project?.startDate
                  ? formatDate(project.startDate)
                  : "Non défini"}{" "}
                -{project?.dueDate ? formatDate(project.dueDate) : "Non défini"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Responsable</div>
              <div className="text-sm text-muted-foreground">
                {project.manager || "Non assigné"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Adresse</div>
              <div className="text-sm text-muted-foreground">
                {project.location || "Non spécifiée"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Documents</div>
              <div className="text-sm text-muted-foreground">13 fichiers</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
