
import { Check, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/components/gantt/types";
import { toggleTaskCompletion, deleteTask } from "@/components/services/taskService";
import { toast } from "sonner";
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  title: string;
  onCompleteTask?: (id: string, completed: boolean) => void;
  onDeleteTask?: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

const priorityConfig = {
  low: { color: "bg-green-500/10 text-green-700 border-green-500/30" },
  medium: { color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30" },
  high: { color: "bg-red-500/10 text-red-700 border-red-500/30" },
};

const TaskList = ({ tasks, title, onCompleteTask, onDeleteTask, onEditTask }: TaskListProps) => {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short"
    }).format(date);
  };

  const isOverdue = (dateString: string | undefined) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const now = new Date();
    return dueDate < now && !isToday(dueDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const handleCheckboxChange = async (id: string, checked: boolean) => {
    try {
      setLoadingTaskId(id);
      await toggleTaskCompletion(id, checked);
      if (onCompleteTask) {
        onCompleteTask(id, checked);
      }
    } catch (error) {
      toast.error("Échec de la mise à jour de la tâche");
      console.error(error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setLoadingTaskId(id);
      await deleteTask(id);
      if (onDeleteTask) {
        onDeleteTask(id);
      }
    } catch (error) {
      toast.error("Échec de la suppression de la tâche");
      console.error(error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className={`flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors ${loadingTaskId === task.id ? 'opacity-70' : ''}`}>
              <Checkbox
                id={`task-${task.id}`} 
                checked={task.completed}
                onCheckedChange={(checked) => handleCheckboxChange(task.id, checked as boolean)}
                className="mt-1"
                disabled={loadingTaskId === task.id}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`font-medium line-clamp-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title || task.name}
                  </label>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" disabled={loadingTaskId === task.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTask(task)}>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Assigner</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="text-xs text-muted-foreground line-clamp-1">{task.projectName}</span>

                  <div className="flex items-center gap-2 ml-auto">
                    {task.priority && (
                      <Badge variant="outline" className={`text-xs px-1.5 py-0 ${priorityConfig[task.priority].color}`}>
                        {task.priority === 'low' ? 'Faible' : task.priority === 'medium' ? 'Moyenne' : 'Haute'}
                      </Badge>
                    )}

                    {task.dueDate && (
                      <div
                        className={`flex items-center text-xs ${
                          isOverdue(task.dueDate) ? 'text-destructive' : isToday(new Date(task.dueDate)) ? 'text-yellow-600' : 'text-muted-foreground'
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="flex items-center justify-center p-6 text-muted-foreground">
              <div className="flex flex-col items-center">
                <Check className="h-6 w-6 mb-2 text-green-500" />
                <p>Aucune tâche</p>
              </div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TaskList;
