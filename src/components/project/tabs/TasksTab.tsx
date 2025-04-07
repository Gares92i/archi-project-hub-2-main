
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskList from "@/components/TaskList";
import { Task } from "@/components/gantt/types";

interface TasksTabProps {
  projectId: string;
  tasks: Task[];
}

export const TasksTab = ({ projectId, tasks }: TasksTabProps) => {
  const navigate = useNavigate();
  
  const handleNavigateToTasksPage = () => {
    navigate(`/tasks`);
  };

  return (
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
  );
};
