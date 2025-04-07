
import MainLayout from "@/components/layout/MainLayout";
import ProjectCard from "@/components/ProjectCard";
import { projectsData } from "@/components/project/ProjectData";
import { Document } from "@/components/DocumentsList";
import DocumentsList from "@/components/DocumentsList";

const Index = () => {
  const recentProjects = projectsData.slice(0, 3);

  // This function fixes references to documents in the Index page
  const fixDocumentsInIndexPage = () => {
    // Find the section with recentDocuments declaration and update it
    const recentDocuments: Document[] = [
      {
        id: "1",
        name: "Rapport visite Villa Moderna.pdf",
        type: "pdf",
        projectName: "Villa Moderna",
        uploadDate: "2023-03-15",
        size: "5.2 MB",
        projectId: "1"  // Added projectId
      },
      {
        id: "2",
        name: "Plans d'exécution Tour Horizon.doc",
        type: "doc",
        projectName: "Tour Horizon",
        uploadDate: "2023-03-10",
        size: "2.8 MB",
        projectId: "2"  // Added projectId
      },
      {
        id: "3",
        name: "Notes de réunion.txt",
        type: "other",
        projectName: "Résidence Eterna",
        uploadDate: "2023-03-08",
        size: "0.5 MB",
        projectId: "3"  // Added projectId
      },
      {
        id: "4",
        name: "Rendus 3D Façade Sud.jpg",
        type: "img",
        projectName: "Villa Moderna",
        uploadDate: "2023-03-05",
        size: "8.7 MB",
        projectId: "1"  // Added projectId
      },
    ];

    return recentDocuments;
  }

  const recentDocuments = fixDocumentsInIndexPage();

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Suivez l'état de vos projets et les dernières activités
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <DocumentsList title="Documents récents" documents={recentDocuments} />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Projets récents</h2>
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id}
                  name={project.name}
                  client={project.client}
                  location={project.location}
                  startDate={project.startDate}
                  endDate={project.endDate}
                  progress={project.progress}
                  status={project.status}
                  teamSize={project.teamSize}
                  imageUrl={project.imageUrl}
                  teamMembers={project.teamMembers}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
