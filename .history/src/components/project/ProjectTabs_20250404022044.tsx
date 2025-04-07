import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskList from "@/components/TaskList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { SiteVisitReportsList } from "./SiteVisitReportsList";
import { Annotation } from "@/components/annotations/types";
import { useAnnotations } from "@/components/annotations/useAnnotations";
import { AnnotationsTable } from "./AnnotationsTable";
import { ErrorBoundary } from "react-error-";

interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ProjectStats {
  budgetTotal: number;
  budgetUsed: number;
  timelineProgress: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksTodo: number;
  documentsCount: number;
  commentsCount: number;
  meetingsCount: number;
  projectId: string;
}

interface ProjectTabsProps {
  projectId: string;
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: ProjectMilestone[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  tasks: Task[];
  formatDate: (dateString: string) => string;
}

export const ProjectTabs = ({
  projectId,
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  tasks,
  formatDate
}: ProjectTabsProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Exemple d'annotations pour le projet
  const projectAnnotations: Annotation[] = [
    {
      id: "1",
      position: { x: 350, y: 300 },
      comment: "Le plus haut possible sous la poutre. La hauteur définitive dépendra plutôt du chiffrage de ces baies vitrées mais nous allons les prévoir le plus haut possible.",
      author: "Jude RAVI",
      date: "Il y a 1 mois",
      isResolved: false,
      photos: ["/placeholder.svg"],
      projectId
    },
    {
      id: "2",
      position: { x: 700, y: 350 },
      comment: "Merci de me faire une validation sur ce point",
      author: "Vous",
      date: "Il y a 1 mois",
      isResolved: true,
      photos: [],
      projectId
    },
    {
      id: "3",
      position: { x: 500, y: 650 },
      comment: "Vérifier les dimensions ici",
      author: "Équipe Technique",
      date: "Il y a 2 semaines",
      isResolved: false,
      photos: [],
      projectId
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleNavigateToTasksPage = () => {
    navigate(`/tasks`);
  };

  const handleNavigateToAnnotations = () => {
    navigate(`/projects/${projectId}/annotations`);
  };

  // Initialiser les documents annotations pour ce projet
  const initialDocuments = projectDocuments || []; 
  
  // Utiliser le hook useAnnotations avec le projectId
  const { documents } = useAnnotations(initialDocuments, projectId);

  return (
    <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="tasks">Tâches</TabsTrigger>
        <TabsTrigger value="team">Équipe</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="milestones">Jalons</TabsTrigger>
        <TabsTrigger value="reports">Comptes Rendus</TabsTrigger>
        <TabsTrigger value="annotations">Annotations</TabsTrigger>
      </TabsList>
      
      
      <TabsContent value="overview">
        <ProjectOverviewTab
          projectTasks={projectTasks}
          teamMembers={teamMembers}
          projectMilestones={projectMilestones}
          projectDocuments={projectDocuments}
          projectStats={projectStats}
          formatDate={formatDate}
          handleNavigateToTasksPage={handleNavigateToTasksPage}
        />
      </TabsContent>

      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Tâches</CardTitle>
                <CardDescription>Gérez les tâches du projet</CardDescription>
              </div>
              <Button onClick={handleNavigateToTasksPage}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle tâche
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskList 
              tasks={tasks} 
              title="Toutes les tâches"
              onCompleteTask={() => {}} 
              onDeleteTask={() => {}}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="team">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Équipe</CardTitle>
                <CardDescription>Membres de l'équipe travaillant sur ce projet</CardDescription>
              </div>
              <Button onClick={() => navigate('/team')}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <div key={member.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-3">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/team/${member.id}`)}>Profil</Button>
                    <Button variant="outline" size="sm">Message</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Tous les documents liés au projet</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/documents')}>
                  Importer
                </Button>
                <Button onClick={() => navigate('/documents')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau document
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          doc.type === 'pdf' ? 'border-red-200 text-red-700 bg-red-50' :
                          doc.type === 'xls' ? 'border-green-200 text-green-700 bg-green-50' :
                          doc.type === 'img' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          'border-gray-200'
                        }>
                          {doc.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{formatDate(doc.date)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Télécharger</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="milestones">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Jalons</CardTitle>
                <CardDescription>Progression des étapes clés du projet</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un jalon
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projectMilestones.map(milestone => (
                <div key={milestone.id} className="flex items-center gap-4 border-l-4 pl-4 py-2" 
                  style={{ borderColor: milestone.completed ? '#22c55e' : '#e5e7eb' }}>
                  <div className="flex-1">
                    <p className="font-medium text-lg">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                  <Badge variant={milestone.completed ? "default" : "outline"} className="ml-auto">
                    {milestone.completed ? "Complété" : "À venir"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Comptes Rendus de Visite</CardTitle>
                <CardDescription>Rapports hebdomadaires des visites de chantier</CardDescription>
              </div>
              <Button onClick={() => navigate(`/projects/${projectId}/report/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Compte Rendu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SiteVisitReportsList formatDate={formatDate} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="annotations">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Annotations</CardTitle>
                <CardDescription>Annotations et commentaires sur les plans et documents</CardDescription>
              </div>
              <Button onClick={() => navigate(`/project/${projectId}/annotations`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annotation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ErrorBoundary fallback={
              <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
                Une erreur est survenue lors du chargement des annotations.
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                  Rafraîchir
                </Button>
              </div>
            }>
              <AnnotationsTable 
                projectId={projectId}
                documents={projectDocuments} 
              />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
