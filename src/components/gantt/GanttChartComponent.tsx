
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip, CustomBar } from "./ChartComponents";
import { ChartTask, DragState } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface GanttChartComponentProps {
  projectName: string;
  chartData: ChartTask[];
  dateRange: Date[];
  isLoading?: boolean;
  onTaskUpdate?: (taskId: string, newStart: Date, newEnd: Date) => void;
}

const GanttChartComponent = ({ 
  projectName, 
  chartData, 
  dateRange,
  isLoading = false,
  onTaskUpdate 
}: GanttChartComponentProps) => {
  const [dragState, setDragState] = useState<DragState>({
    taskId: null,
    originalStart: null,
    originalEnd: null,
    startPosition: null,
    type: null
  });

  const handleMouseDown = (taskId: string, start: number, end: number, position: number, type: 'move' | 'resize-start' | 'resize-end') => {
    setDragState({
      taskId,
      originalStart: start,
      originalEnd: end,
      startPosition: position,
      type
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.taskId || !dragState.originalStart || !dragState.originalEnd || dragState.startPosition === null) return;
    
    // Calculate the number of days moved based on chart coordinates
    const chartContainer = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const chartWidth = chartContainer.width;
    const dayWidth = chartWidth / dateRange.length;
    const daysOffset = Math.round((e.clientX - dragState.startPosition) / dayWidth);
    
    if (daysOffset === 0) return;

    // Find the task being updated
    const task = chartData.find(t => t.id === dragState.taskId);
    if (!task) return;

    // Update task based on drag type
    const originalStartDate = new Date(task.start);
    const originalEndDate = new Date(task.end);
    let newStartDate = new Date(originalStartDate);
    let newEndDate = new Date(originalEndDate);

    if (dragState.type === 'move') {
      newStartDate.setDate(originalStartDate.getDate() + daysOffset);
      newEndDate.setDate(originalEndDate.getDate() + daysOffset);
    } else if (dragState.type === 'resize-start') {
      newStartDate.setDate(originalStartDate.getDate() + daysOffset);
      // Ensure start date doesn't go beyond end date
      if (newStartDate > newEndDate) {
        newStartDate = new Date(newEndDate);
      }
    } else if (dragState.type === 'resize-end') {
      newEndDate.setDate(originalEndDate.getDate() + daysOffset);
      // Ensure end date doesn't go before start date
      if (newEndDate < newStartDate) {
        newEndDate = new Date(newStartDate);
      }
    }

    // Call the update handler
    if (onTaskUpdate) {
      onTaskUpdate(task.id, newStartDate, newEndDate);
      
      // Reset drag state after update to allow a fresh drag
      setDragState({
        taskId: null,
        originalStart: null,
        originalEnd: null,
        startPosition: null,
        type: null
      });
    }
  };

  const handleMouseUp = () => {
    setDragState({
      taskId: null,
      originalStart: null,
      originalEnd: null,
      startPosition: null,
      type: null
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="min-w-[800px] h-[400px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{projectName} - Planning des tâches</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div 
            className="w-full overflow-x-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="min-w-[800px] h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  barSize={20}
                >
                  <XAxis 
                    type="number" 
                    domain={[0, dateRange.length]} 
                    tickFormatter={(tick) => {
                      if (tick < dateRange.length) {
                        return format(dateRange[tick], 'dd/MM', { locale: fr });
                      }
                      return '';
                    }}
                    ticks={dateRange.filter((_, i) => i % 7 === 0).map((_, i) => i * 7)}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip dateRange={dateRange} />} />
                  <Bar 
                    dataKey="duration" 
                    stackId="a" 
                    fill="#8884d8" 
                    shape={<CustomBar onMouseDown={handleMouseDown} dateRange={dateRange} />}
                    background={{ fill: 'transparent' }}
                    barSize={20}
                    minPointSize={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Aucune tâche trouvée pour ce projet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GanttChartComponent;
