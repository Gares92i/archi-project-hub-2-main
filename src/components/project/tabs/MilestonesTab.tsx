
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  projectId: string;
}

interface MilestonesTabProps {
  projectMilestones: ProjectMilestone[];
  formatDate: (dateString: string) => string;
}

export const MilestonesTab = ({ projectMilestones, formatDate }: MilestonesTabProps) => {
  return (
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
  );
};
