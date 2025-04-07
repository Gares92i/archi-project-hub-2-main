
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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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
  }, [id, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Projet non trouvé</p>
        </div>
      </MainLayout>
    );
  }
  
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
      />
    </MainLayout>
  );
};

export default ProjectDetails;
