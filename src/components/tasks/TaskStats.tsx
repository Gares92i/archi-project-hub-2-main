
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/components/gantt/types";

interface TaskStatsProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  highPriorityTasks: Task[];
  overdueTasks: Task[];
}

const TaskStats = ({ pendingTasks, completedTasks, highPriorityTasks, overdueTasks }: TaskStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">À faire</p>
              <p className="text-3xl font-semibold">{pendingTasks.length}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Terminées</p>
              <p className="text-3xl font-semibold">{completedTasks.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Priorité haute</p>
              <p className="text-3xl font-semibold">{highPriorityTasks.length}</p>
            </div>
            <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">En retard</p>
              <p className="text-3xl font-semibold">{overdueTasks.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStats;
