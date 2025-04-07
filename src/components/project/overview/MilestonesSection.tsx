
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectMilestone } from "./types";

interface MilestonesSectionProps {
  projectMilestones: ProjectMilestone[];
  formatDate: (dateString: string) => string;
}

export const MilestonesSection = ({ 
  projectMilestones,
  formatDate
}: MilestonesSectionProps) => {
  return (
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
  );
};
