
import MainLayout from "@/components/layout/MainLayout";
import DocumentsList, { Document } from "@/components/DocumentsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Documents = () => {
  // Dummy data for documents
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
    {
      id: "5",
      name: "Budget prévisionnel.xls",
      type: "xls",
      projectName: "Tour Horizon",
      uploadDate: "2023-03-01",
      size: "1.2 MB",
      projectId: "2"  // Added projectId
    },
  ];

  const allDocuments: Document[] = [
    ...recentDocuments,
    {
      id: "6",
      name: "Cahier des charges.pdf",
      type: "pdf",
      projectName: "Centre Commercial Lumina",
      uploadDate: "2023-02-25",
      size: "3.5 MB",
      projectId: "4"  // Added projectId
    },
    {
      id: "7",
      name: "Compte-rendu visite chantier.pdf",
      type: "pdf",
      projectName: "Résidence Eterna",
      uploadDate: "2023-02-20",
      size: "2.1 MB",
      projectId: "3"  // Added projectId
    },
    {
      id: "8",
      name: "Inspiration design intérieur.jpg",
      type: "img",
      projectName: "Bureaux Panorama",
      uploadDate: "2023-02-15",
      size: "6.3 MB",
      projectId: "5"  // Added projectId
    },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Documents</h1>
        <p className="text-muted-foreground">
          Gérez et accédez à tous vos documents de projets
        </p>
      </div>

      <div className="mb-6 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentsList 
          title="Documents récents" 
          documents={recentDocuments} 
        />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Tous les documents</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DocumentsList 
              title="Tous les documents" 
              documents={allDocuments} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Documents;
