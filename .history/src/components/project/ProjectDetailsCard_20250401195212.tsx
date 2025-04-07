
import { Building, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCardProps } from "@/components/ProjectCard";

interface ProjectDetailsCardProps {
  project: ProjectCardProps;
  formatDate: (dateString: string) => string;
}

export const ProjectDetailsCard = ({ project, formatDate }: ProjectDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Détails du projet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{project.client}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Localisation</p>
              <p className="font-medium">{project.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Période</p>
              <p className="font-medium">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Équipe</p>
              <p className="font-medium">{project.teamSize} membres</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
