import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, FileText, MessageCircle, ListChecks } from "lucide-react";
import TaskList from "@/components/TaskList";
import { Task } from "@/components/gantt/types";
import { Document } from "@/components/DocumentsList";

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

interface ProjectOverviewTabProps {
  projectTasks: Task[];
  teamMembers: TeamMember[];
  projectMilestones: ProjectMilestone[];
  projectDocuments: Document[];
  projectStats: ProjectStats;
  formatDate: (dateString: string) => string;
  handleNavigateToTasksPage: () => void;
}

export const ProjectOverviewTab = ({
  projectTasks,
  teamMembers,
  projectMilestones,
  projectDocuments,
  projectStats,
  formatDate,
  handleNavigateToTasksPage
}: ProjectOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Tâches récentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNavigateToTasksPage}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskList 
              tasks={projectTasks.slice(0, 3)} 
              title="Tâches récentes"
              onCompleteTask={() => {}}
              onDeleteTask={() => {}}
            />
          </CardContent>
        </Card>
              
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Jalons du projet</CardTitle>
              <Button variant="ghost" size="sm" className="text-sm">
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectMilestones.slice(0, 3).map(milestone => (
                <div key={milestone.id} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(milestone.date) < new Date() && !milestone.completed 
                        ? "En retard - " 
                        : ""}
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                  <Badge variant={milestone.completed ? "default" : "outline"}>
                    {milestone.completed ? "Terminé" : "À venir"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
            
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Équipe du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.slice(0, 4).map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
              {teamMembers.length > 4 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Voir tous les membres ({teamMembers.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
              
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Documents récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectDocuments.slice(0, 3).map(doc => (
                <div key={doc.id} className="flex items-center gap-3 border rounded-md p-2">
                  <div className={`p-2 rounded-md ${
                    doc.type === 'pdf' ? 'bg-red-100 text-red-700' :
                    doc.type === 'xls' ? 'bg-green-100 text-green-700' : 
                    doc.type === 'img' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • {formatDate(doc.date!)}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full">
                Voir tous les documents ({projectDocuments.length})
              </Button>
            </div>
          </CardContent>
        </Card>
              
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 border rounded-md">
                <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-semibold">{projectStats.documentsCount}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="text-center p-2 border rounded-md">
                <ListChecks className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-semibold">{projectStats.tasksCompleted + projectStats.tasksInProgress + projectStats.tasksTodo}</p>
                <p className="text-xs text-muted-foreground">Tâches</p>
              </div>
              <div className="text-center p-2 border rounded-md">
                <MessageCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-semibold">{projectStats.commentsCount}</p>
                <p className="text-xs text-muted-foreground">Commentaires</p>
              </div>
              <div className="text-center p-2 border rounded-md">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-semibold">{projectStats.meetingsCount}</p>
                <p className="text-xs text-muted-foreground">Réunions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
