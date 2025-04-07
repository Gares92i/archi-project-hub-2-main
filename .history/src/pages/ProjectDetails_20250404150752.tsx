import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getTasksByProjectId } from "@/components/services/taskService";
import { getProjectById } from "@/components/services/projectService";
import { Task } from "@/components/gantt/types";
import { toast } from "sonner";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectDetailsCard } from "@/components/project/ProjectDetailsCard";
import { ProjectBudgetCard } from "@/components/project/ProjectBudgetCard";
import { ProjectProgressCard } from "@/components/project/ProjectProgressCard";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import {
  teamMembers,
  projectDocuments,
  projectMilestones,
  projectStats
} from "@/components/project/ProjectData";
import { ProjectCardProps } from "@/components/ProjectCard";
import { Annotation } from "@/components/annotations/types";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectAnnotations, setProjectAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Charger les détails du projet
        const projectData = await getProjectById(id);

        if (projectData) {
          setProject(projectData);
          // Charger les tâches du projet
          const projectTasks = await getTasksByProjectId(id);
          setTasks(projectTasks);
        } else {
          toast.error("Projet non trouvé");
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données du projet :", error);
        toast.error("Erreur lors du chargement des données du projet");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();

    // Chargement des annotations depuis localStorage
    const loadAnnotations = () => {
      const storageKey = `project_${id}_annotationsState`;
      const savedState = localStorage.getItem(storageKey);

      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);

          // Extraire les annotations de tous les documents
          const allAnnotations: Annotation[] = [];

          if (parsedState && parsedState.documents) {
            parsedState.documents.forEach((doc: any) => {
              if (doc.annotations && Array.isArray(doc.annotations)) {
                doc.annotations.forEach((ann: any) => {
                  // Normaliser la structure pour correspondre à ce qu'attend AnnotationsTable
                  allAnnotations.push({
                    id: ann.id,
                    x: ann.x || (ann.position?.x ?? 0),
                    y: ann.y || (ann.position?.y ?? 0),
                    position: {
                      x: ann.x || (ann.position?.x ?? 0), 
                      y: ann.y || (ann.position?.y ?? 0) 
                    },
                    comment: ann.comment || "",
                    resolved: ann.resolved || false,
                    isResolved: ann.resolved || false,
                    createdAt: ann.createdAt || new Date().toISOString(),
                    date: ann.createdAt || new Date().toISOString(),
                    photos: ann.photos || [],
                    projectId: id,
                    documentId: doc.id,
                    documentName: doc.name
                  });
                });
              }
            });
          }
          
          console.log(`Chargé ${allAnnotations.length} annotations pour le projet ${id}`);
          setProjectAnnotations(allAnnotations);
        } catch (error) {
          console.error("Erreur lors du chargement des annotations:", error);
        }
      }
    };
    
    loadAnnotations();
    
    // Ajouter un écouteur d'événement pour recharger les annotations quand demandé
    const handleReloadAnnotations = () => {
      loadAnnotations();
    };
    
    window.addEventListener('reloadAnnotations', handleReloadAnnotations);
    return () => {
      window.removeEventListener('reloadAnnotations', handleReloadAnnotations);
    };
  }, [id, navigate]);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Use the project ID for the stats to ensure we're showing project-specific data
  const projectSpecificStats = {
    ...projectStats,
    projectId: id
  };

  // Filter milestones and documents by project ID
  const filteredMilestones = projectMilestones.filter(milestone => milestone.projectId === id);
  const filteredDocuments = projectDocuments.filter(doc => doc.projectId === id);

  return (
    <MainLayout>
      <ProjectHeader project={project} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ProjectDetailsCard project={project} formatDate={formatDate} />
        <ProjectBudgetCard stats={projectSpecificStats} />
        <ProjectProgressCard stats={projectSpecificStats} projectId={id} />
      </div>
      
      <ProjectTabs 
        projectId={id}
        projectTasks={tasks}
        teamMembers={teamMembers}
        projectMilestones={filteredMilestones}
        projectDocuments={filteredDocuments}
        projectStats={projectSpecificStats}
        tasks={tasks}
        formatDate={formatDate}
        projectAnnotations={projectAnnotations} // Passer les annotations chargées
      />
    </MainLayout>
  );
};

export default ProjectDetails;
