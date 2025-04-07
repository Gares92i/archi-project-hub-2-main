
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Calendar, FileText, ListChecks, MessageCircle } from "lucide-react";
import { ProjectStats } from "./types";

interface StatisticsSectionProps {
  projectStats: ProjectStats;
}

export const StatisticsSection = ({ projectStats }: StatisticsSectionProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 border rounded-md bg-card-hover hover:shadow-md transition-all">
            <FileText className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-semibold">{projectStats.documentsCount}</p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
          <div className="text-center p-2 border rounded-md bg-card-hover hover:shadow-md transition-all">
            <ListChecks className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-xl font-semibold">{projectStats.tasksCompleted + projectStats.tasksInProgress + projectStats.tasksTodo}</p>
            <p className="text-xs text-muted-foreground">Tâches</p>
          </div>
          <div className="text-center p-2 border rounded-md bg-card-hover hover:shadow-md transition-all">
            <MessageCircle className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-xl font-semibold">{projectStats.commentsCount}</p>
            <p className="text-xs text-muted-foreground">Commentaires</p>
          </div>
          <div className="text-center p-2 border rounded-md bg-card-hover hover:shadow-md transition-all">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xl font-semibold">{projectStats.meetingsCount}</p>
            <p className="text-xs text-muted-foreground">Réunions</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Voir toutes les statistiques</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
