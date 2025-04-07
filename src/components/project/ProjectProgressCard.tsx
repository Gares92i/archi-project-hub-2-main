
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getAllReportsByProjectId } from "@/components/services/reportService";
import { SiteVisitReport } from "@/components/services/types";

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
}

interface ProjectProgressCardProps {
  stats: ProjectStats;
  projectId: string;
}

export const ProjectProgressCard = ({ stats, projectId }: ProjectProgressCardProps) => {
  const [progressFromReports, setProgressFromReports] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchLatestProgress = async () => {
      try {
        // Get all reports for this project
        const reports = await getAllReportsByProjectId(projectId);
        
        if (reports.length > 0) {
          // Sort reports by date, newest first
          const sortedReports = [...reports].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          // Get the latest progress from the most recent report
          setProgressFromReports(sortedReports[0].progress);
        }
      } catch (error) {
        console.error("Error fetching project progress:", error);
      }
    };
    
    fetchLatestProgress();
  }, [projectId]);
  
  // Use the progress from reports if available, otherwise use the one from stats
  const displayProgress = progressFromReports !== null ? progressFromReports : stats.timelineProgress;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Timeline</p>
              <p className="text-sm font-medium">{displayProgress}%</p>
            </div>
            <Progress value={displayProgress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="border rounded-lg p-2 text-center">
              <p className="text-green-600 font-medium">{stats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Complétées</p>
            </div>
            <div className="border rounded-lg p-2 text-center">
              <p className="text-blue-600 font-medium">{stats.tasksInProgress}</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
            <div className="border rounded-lg p-2 text-center">
              <p className="text-gray-600 font-medium">{stats.tasksTodo}</p>
              <p className="text-xs text-muted-foreground">À faire</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
