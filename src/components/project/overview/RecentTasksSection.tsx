
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/TaskList";
import { Task } from "@/components/gantt/types";

interface RecentTasksSectionProps {
  projectTasks: Task[];
  handleNavigateToTasksPage: () => void;
}

export const RecentTasksSection = ({ 
  projectTasks,
  handleNavigateToTasksPage
}: RecentTasksSectionProps) => {
  return (
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
  );
};
