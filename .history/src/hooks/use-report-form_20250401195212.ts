
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addReport, getReportById, updateReport } from "@/components/services/reportService";
import { getProjectById } from "@/components/services/projectService";
import { Observation, Recommendation } from "@/components/services/types";
import { ProjectCardProps } from "@/components/ProjectCard";
import { reportTemplates } from "@/components/project/ReportTemplateSelector";

// Form schema
export const formSchema = z.object({
  visitDate: z.date({
    required_error: "La date de visite est requise",
  }),
  contractor: z.string().min(1, "Le nom de l'entreprise est requis"),
  inCharge: z.string().min(1, "Le nom du responsable est requis"),
  progress: z.number().min(0).max(100),
  additionalDetails: z.string().optional(),
});

export const useReportForm = () => {
  const { projectId, reportId } = useParams<{ projectId: string; reportId: string }>();
  const navigate = useNavigate();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitDate: new Date(),
      contractor: "",
      inCharge: "",
      progress: 0,
      additionalDetails: "",
    },
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
      }
    };
    
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setIsLoading(true);
        const reportData = await getReportById(reportId);
        
        if (reportData) {
          setIsEditing(true);
          
          // Set form values
          form.setValue("visitDate", new Date(reportData.visitDate));
          form.setValue("contractor", reportData.contractor);
          form.setValue("inCharge", reportData.inCharge);
          form.setValue("progress", reportData.progress);
          form.setValue("additionalDetails", reportData.additionalDetails || "");
          
          // Set observations, recommendations, and photos
          setObservations(reportData.observations);
          setRecommendations(reportData.recommendations);
          setPhotos(reportData.photos);
          
          // Determine template based on report data
          determineTemplate(reportData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du rapport:", error);
        toast.error("Erreur lors du chargement du rapport");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
    if (reportId) {
      fetchReport();
    }
  }, [projectId, reportId, form]);

  // Determine the appropriate template based on report data
  const determineTemplate = (reportData: any) => {
    if (reportData.observations && reportData.recommendations && reportData.additionalDetails) {
      setSelectedTemplate("detailed");
    } else if (reportData.observations && !reportData.recommendations) {
      setSelectedTemplate("simple");
    } else {
      setSelectedTemplate("standard");
    }
  };

  // Check if a section should be displayed based on the selected template
  const shouldShowSection = (sectionName: string): boolean => {
    const template = reportTemplates.find(t => t.id === selectedTemplate);
    return template?.fields.includes(sectionName) || false;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      // Validate observations and recommendations
      const validObservations = observations.every(obs => obs.observation && obs.description);
      
      if (!validObservations) {
        toast.error("Veuillez compléter toutes les observations");
        return;
      }
      
      // Check recommendations only if they are included in the selected template
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const includesRecommendations = template?.fields.includes("recommendations");
      
      if (includesRecommendations && recommendations.length > 0) {
        const validRecommendations = recommendations.every(rec => rec.observation && rec.action && rec.responsible);
        if (!validRecommendations) {
          toast.error("Veuillez compléter toutes les recommandations");
          return;
        }
      }
      
      const reportData = {
        projectId,
        visitDate: values.visitDate.toISOString(),
        contractor: values.contractor,
        inCharge: values.inCharge,
        progress: values.progress,
        observations,
        recommendations: includesRecommendations ? recommendations : [],
        additionalDetails: template?.fields.includes("additionalDetails") ? values.additionalDetails || "" : "",
        photos,
        signatures: {},
        templateId: selectedTemplate
      };
      
      if (isEditing && reportId) {
        await updateReport(reportId, reportData);
        toast.success("Compte rendu mis à jour avec succès");
        navigate(`/projects/${projectId}/report/${reportId}`);
      } else {
        const newReport = await addReport(reportData);
        toast.success("Compte rendu créé avec succès");
        navigate(`/projects/${projectId}/report/${newReport.id}`);
      }
      
    } catch (error) {
      console.error("Erreur lors de la création du compte rendu:", error);
      toast.error("Erreur lors de la création du compte rendu");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    observations,
    setObservations,
    recommendations,
    setRecommendations,
    photos,
    setPhotos,
    project,
    isLoading,
    isEditing,
    selectedTemplate,
    setSelectedTemplate,
    shouldShowSection,
    projectId,
    formSchema
  };
};
