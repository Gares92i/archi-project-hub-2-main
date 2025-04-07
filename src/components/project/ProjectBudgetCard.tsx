
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

interface ProjectBudgetCardProps {
  stats: ProjectStats;
}

export const ProjectBudgetCard = ({ stats }: ProjectBudgetCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Budget utilisé</p>
              <p className="text-sm font-medium">{Math.round(stats.budgetUsed / stats.budgetTotal * 100)}%</p>
            </div>
            <Progress value={Math.round(stats.budgetUsed / stats.budgetTotal * 100)} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium text-lg">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dépensé</p>
              <p className="font-medium text-lg">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetUsed)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
