
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { ProjectHeader } from "@/components/project/edit/ProjectHeader";
import { GeneralInfoCard } from "@/components/project/edit/GeneralInfoCard";
import { TeamMembersCard } from "@/components/project/edit/TeamMembersCard";
import { ProjectImageCard } from "@/components/project/edit/ProjectImageCard";
import { LoadingState } from "@/components/project/edit/LoadingState";
import { NotFoundState } from "@/components/project/edit/NotFoundState";
import { useEditProject } from "@/hooks/useEditProject";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const {
    isLoading,
    isSaving,
    project,
    teamMembers,
    clients,
    selectedTeamMembers,
    handleSelectTeamMember,
    handleInputChange,
    handleImageUploaded,
    handleSaveProject
  } = useEditProject(id);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!project) {
    return <NotFoundState />;
  }
  
  return (
    <MainLayout>
      <ProjectHeader 
        id={id as string}
        isSaving={isSaving}
        onSave={handleSaveProject}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfoCard 
            project={project}
            clients={clients}
            onInputChange={handleInputChange}
          />
          
          <TeamMembersCard 
            teamMembers={teamMembers}
            selectedTeamMembers={selectedTeamMembers}
            onSelectTeamMember={handleSelectTeamMember}
          />
        </div>
        
        <div>
          <ProjectImageCard 
            imageUrl={project.imageUrl}
            projectName={project.name}
            onImageUploaded={handleImageUploaded}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProject;
