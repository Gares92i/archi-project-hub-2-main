import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { TasksTab } from "./tabs/TasksTab";
import { TeamTab } from "./tabs/TeamTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { MilestonesTab } from "./tabs/MilestonesTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { AnnotationsTab } from "./tabs/AnnotationsTab";
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";
import { Annotation } from "@/components/annotations/types";
import { TeamMember, ProjectMilestone, ProjectStats } from "./tabs/types";

interface ProjectTabsProps {
  projectId: string;
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: ProjectMilestone[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  tasks: Task[];
  formatDate: (dateString: string) => string;
  projectAnnotations: Annotation[]; // ← Vient maintenant du parent
}

export const ProjectTabs = ({
  projectId,
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  tasks,
  formatDate,
  projectAnnotations, // ← Vient maintenant du parent
}: ProjectTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue="overview"
      className="mb-8"
      value={activeTab}
      onValueChange={handleTabChange}>
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
          handleNavigateToTasksPage={() => setActiveTab("tasks")}
        />
      </TabsContent>

      <TabsContent value="tasks">
        <TasksTab projectId={projectId} tasks={tasks} />
      </TabsContent>

      <TabsContent value="team">
        <TeamTab teamMembers={teamMembers} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTab
          projectDocuments={projectDocuments}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="milestones">
        <MilestonesTab
          projectMilestones={projectMilestones}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="reports">
        <ReportsTab projectId={projectId} formatDate={formatDate} />
      </TabsContent>

      <TabsContent value="annotations">
        <AnnotationsTab
          annotations={projectAnnotations}
          projectId={projectId}
        />
      </TabsContent>
    </Tabs>
  );
};
