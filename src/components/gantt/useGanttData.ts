
import { useState, useEffect, useCallback } from "react";
import { Project, ChartTask, Task } from "./types";
import { getTasksByProjectId, updateTaskDates } from "@/components/services/taskService";

export const useGanttData = (currentProject: Project) => {
  const [chartData, setChartData] = useState<ChartTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const projectTasks = await getTasksByProjectId(currentProject.id);
      setTasks(projectTasks);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    } finally {
      setLoading(false);
    }
  }, [currentProject.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const formatTasksForChart = useCallback((projectTasks: Task[]) => {
    return projectTasks.map(task => ({
      id: task.id,
      name: task.name || task.title || "",
      start: new Date(task.start).getTime(),
      end: new Date(task.end).getTime(),
      progress: task.progress,
      startPosition: 0,
      duration: Math.ceil((new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)) + 1
    }));
  }, []);

  useEffect(() => {
    if (!tasks.length) {
      setChartData([]);
      return;
    }
    
    const formattedData = formatTasksForChart(tasks);
    setChartData(formattedData);
  }, [tasks, formatTasksForChart]);

  const updateTask = useCallback(async (taskId: string, newStart: Date, newEnd: Date, progress: number) => {
    try {
      console.log("Updating task:", taskId, newStart, newEnd, progress);
      // Ensure we're passing the right parameters to updateTaskDates
      const updatedTask = await updateTaskDates(taskId, newStart, newEnd);
      
      // Update the progress separately if needed
      if (updatedTask && typeof progress === 'number') {
        updatedTask.progress = progress;
      }
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  }, []);

  return { chartData, tasks, updateTask, loading, refreshTasks: fetchTasks };
};
