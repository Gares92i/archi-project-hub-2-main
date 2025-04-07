
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useReportForm } from "@/hooks/use-report-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportTemplateSelector } from "@/components/project/ReportTemplateSelector";
import ReportHeader from "@/components/project/ReportHeader";
import { GeneralInfoSection } from "@/components/project/GeneralInfoSection";
import { PhotosSection } from "@/components/project/PhotosSection";
import { ObservationsSection } from "@/components/project/ObservationsSection";
import { RecommendationsSection } from "@/components/project/RecommendationsSection";
import { AdditionalDetailsSection } from "@/components/project/AdditionalDetailsSection";

const SiteVisitReportForm = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
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
  } = useReportForm();

  return (
    <MainLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Modifier le" : "Nouveau"} Compte Rendu de Visite</h1>
          <p className="text-muted-foreground">
            Projet: {project?.name || "Chargement..."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Modèle de rapport</h2>
        <ReportTemplateSelector 
          selectedTemplate={selectedTemplate} 
          onSelectTemplate={setSelectedTemplate} 
        />
      </div>

      {/* Preview header */}
      {projectId && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Aperçu de l'en-tête</h2>
          <ReportHeader 
            projectId={projectId} 
            visitDate={form.getValues("visitDate").toISOString()}
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General information section */}
          <GeneralInfoSection form={form} />

          {/* Photos section */}
          {shouldShowSection("photos") && (
            <PhotosSection photos={photos} setPhotos={setPhotos} />
          )}

          {/* Observations section */}
          {shouldShowSection("observations") && (
            <ObservationsSection 
              observations={observations} 
              setObservations={setObservations} 
              isMobile={isMobile} 
            />
          )}

          {/* Recommendations section */}
          {shouldShowSection("recommendations") && (
            <RecommendationsSection 
              recommendations={recommendations} 
              setRecommendations={setRecommendations} 
              isMobile={isMobile} 
            />
          )}

          {/* Additional details section */}
          {shouldShowSection("additionalDetails") && (
            <AdditionalDetailsSection 
              form={form} 
              showSignatures={shouldShowSection("signatures")} 
              formSchema={formSchema}
            />
          )}

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditing ? "Mise à jour en cours..." : "Création en cours...") : (isEditing ? "Mettre à jour" : "Créer le compte rendu")}
            </Button>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
};

export default SiteVisitReportForm;
