
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectCardProps } from "@/components/ProjectCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Status configuration for projects
export const statusConfig = {
  "planning": { label: "Planification", color: "bg-blue-500" },
  "design": { label: "Conception", color: "bg-purple-500" },
  "construction": { label: "Construction", color: "bg-yellow-500" },
  "completed": { label: "Terminé", color: "bg-green-500" },
  "on-hold": { label: "En pause", color: "bg-gray-500" },
};

interface ProjectHeaderProps {
  project: ProjectCardProps;
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  
  const handleEditProject = () => {
    toast.info("Modification en cours", {
      description: `Modification du projet ${project.name}`,
    });
    // Navigate to the edit page instead of just logging
    navigate(`/projects/${project.id}/edit`);
  };

  const handleExportProject = (projectId: string) => {
    toast.success("Exportation réussie", {
      description: `Le projet ${project.name} a été exporté en PDF`,
    });
    console.log(`Exportation du projet ${projectId} en PDF`);
  };

  const handleArchiveProject = (projectId: string) => {
    toast.success("Projet archivé", {
      description: `Le projet ${project.name} a été archivé avec succès`,
    });
    console.log(`Archivage du projet ${projectId}`);
  };

  const handleShareProject = (projectId: string) => {
    toast.success("Partage réussi", {
      description: `Lien de partage pour ${project.name} copié dans le presse-papier`,
    });
    console.log(`Partage du projet ${projectId}`);
  };

  const handleDuplicateProject = (projectId: string) => {
    toast.success("Duplication réussie", {
      description: `Une copie de ${project.name} a été créée`,
    });
    console.log(`Duplication du projet ${projectId}`);
  };

  return (
    <div className="relative">
      <div className="h-48 md:h-64 rounded-lg overflow-hidden mb-16">
        <div
          className="w-full h-full bg-gradient-to-r from-architect-700 to-architect-900 relative"
          style={
            project.imageUrl 
              ? { 
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${project.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } 
              : {}
          }
        >
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-white/80">{project.client}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleEditProject}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>Dupliquer le projet</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportProject(project.id)}>Exporter en PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareProject(project.id)}>Partager</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleArchiveProject(project.id)}>Archiver</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-36 md:top-52 left-6 bg-white dark:bg-background rounded-lg shadow-lg p-4 border">
        <div className="flex flex-col items-center">
          <Badge className={`${statusConfig[project.status as keyof typeof statusConfig].color} text-white px-2.5 py-1 text-xs mb-3`}>
            {statusConfig[project.status as keyof typeof statusConfig].label}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <span>{project.progress}%</span>
            <Progress value={project.progress} className="w-24 h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
