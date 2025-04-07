import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { TaskList } from "../TaskList";
import { AnnotationsTable } from "./AnnotationsTable";
import { Document, Task, TeamMember, ProjectMilestone } from "@/types";

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
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  projectId,
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  tasks,
  formatDate,
  activeTab = "overview",
  onTabChange
}) => {
  const navigate = useNavigate();
  
  // Fonctions de navigation
  const handleNavigateToTasksPage = useCallback(() => {
    navigate(`/projects/${projectId}/tasks`);
  }, [navigate, projectId]);

  const handleNavigateToAnnotations = useCallback(() => {
    navigate(`/projects/${projectId}/annotations`);
  }, [navigate, projectId]);

  // Gestion des changements d'onglet
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs 
      defaultValue="overview" 
      className="mb-8" 
      value={activeTab}
      onValueChange={handleTabChange}
    >
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
      
      <TabsContent value="annotations">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Annotations</CardTitle>
                <CardDescription>Annotations et commentaires sur les plans et documents</CardDescription>
              </div>
              <Button onClick={handleNavigateToAnnotations}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle annotation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnnotationsTable 
              projectId={projectId}
              documents={projectDocuments}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Autres onglets ici... */}
    </Tabs>
  );
};
