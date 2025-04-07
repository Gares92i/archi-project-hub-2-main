
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getProjectById } from "@/components/services/projectService";
import { toast } from "sonner";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { PlanViewerPage } from "@/components/annotations/PlanViewerPage";
import { ProjectCardProps } from "@/components/ProjectCard";

const ProjectAnnotations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectCardProps | null>(null);
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

  return (
    <MainLayout>
      <ProjectHeader project={project} />
      <div className="h-[calc(100vh-170px)]">
        <PlanViewerPage />
      </div>
    </MainLayout>
  );
};

export default ProjectAnnotations;
