
import { useEffect, useState } from "react";
import { getArchitectInfo } from "@/components/services/reportService";
import { getProjectById } from "@/components/services/projectService";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, User, Calendar, FileText } from "lucide-react";
import { ProjectCardProps } from "@/components/ProjectCard";
import { ArchitectInfo } from "@/components/services/types";

interface ReportHeaderProps {
  projectId: string;
  reportNumber?: string;
  visitDate: string;
}

const ReportHeader = ({ projectId, reportNumber, visitDate }: ReportHeaderProps) => {
  const [architectInfo, setArchitectInfo] = useState<ArchitectInfo | null>(null);
  
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await getArchitectInfo();
        setArchitectInfo(info);
        
        if (projectId) {
          const projectData = await getProjectById(projectId);
          setProject(projectData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, [projectId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  
  if (!architectInfo) {
    return <div>Chargement...</div>;
  }
  
  return (
    <Card className="mb-6 print:shadow-none print:border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              {architectInfo.logo && (
                <img 
                  src={architectInfo.logo} 
                  alt="Logo" 
                  className="h-16 w-16 object-contain"
                />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{architectInfo.name}</h2>
              <p className="text-sm text-muted-foreground">{architectInfo.address}</p>
              <p className="text-sm text-muted-foreground">{architectInfo.phone}</p>
              <p className="text-sm text-muted-foreground">{architectInfo.email}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="font-bold text-lg">COMPTE RENDU DE VISITE</h3>
            {reportNumber && (
              <div className="flex items-center justify-end mt-1">
                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Réf: {reportNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-end mt-1">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Date de visite: {formatDate(visitDate)}</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {project && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Projet</h3>
              <p className="text-lg">{project.name}</p>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">{project.location}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Client</h3>
              <p className="text-lg">{project.client}</p>
              <div className="flex items-center mt-1">
                <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Période: {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportHeader;
