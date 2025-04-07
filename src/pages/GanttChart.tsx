
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import GanttChartComponent from "@/components/gantt/GanttChartComponent";
import ProjectSelector from "@/components/gantt/ProjectSelector";
import { useGanttData } from "@/components/gantt/useGanttData";
import { Task, Project } from "@/components/gantt/types";
import { getAllTasks } from "@/components/services/taskService";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

const GanttChart = () => {
  // Create a default project to pass to useGanttData
  const defaultProject: Project = { id: "", name: "All Projects", tasks: [] };
  const { tasks, loading, updateTask } = useGanttData(defaultProject);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate date range for Gantt chart
  const today = new Date();
  const dateRange = Array.from({ length: 30 }, (_, i) => addDays(today, i));

  // Fetch all tasks and extract projects
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setIsLoading(true);
        const allTasks = await getAllTasks();
        
        // Extract unique projects from tasks
        const projectMap = new Map<string, Project>();
        
        allTasks.forEach(task => {
          if (task.projectId) {
            if (!projectMap.has(task.projectId)) {
              projectMap.set(task.projectId, {
                id: task.projectId,
                name: task.projectName || `Project ${task.projectId}`,
                tasks: []
              });
            }
            projectMap.get(task.projectId)?.tasks.push(task);
          }
        });
        
        setAllProjects(Array.from(projectMap.values()));
        setFilteredTasks(allTasks);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        setIsLoading(false);
      }
    };
    
    fetchAllTasks();
  }, []);

  // Filter tasks when selected project changes
  useEffect(() => {
    if (tasks) {
      if (selectedProject) {
        setFilteredTasks(tasks.filter(task => task.projectId === selectedProject));
      } else {
        setFilteredTasks(tasks);
      }
    }
  }, [tasks, selectedProject]);

  const handleTaskUpdate = async (
    taskId: string, 
    newStart: Date, 
    newEnd: Date
  ) => {
    try {
      // Find the task to get its current progress
      const task = filteredTasks.find(t => t.id === taskId);
      const progress = task?.progress || 0;
      
      // Call updateTask with all required parameters
      await updateTask(taskId, newStart, newEnd, progress);
      toast.success("Tâche mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
      toast.error("Échec de la mise à jour de la tâche");
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Erreur de chargement des données</p>
        </div>
      </MainLayout>
    );
  }

  const selectedProjectObj = allProjects.find(p => p.id === selectedProject) || 
                            { name: "Tous les projets" };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Planning Gantt</h1>
            <p className="text-muted-foreground">
              Visualisez et gérez le planning des projets
            </p>
          </div>
          <ProjectSelector 
            projects={allProjects}
            selectedProjectId={selectedProject}
            onProjectChange={setSelectedProject}
          />
        </div>
        
        <GanttChartComponent 
          projectName={selectedProjectObj.name}
          chartData={filteredTasks.map(task => ({
            id: task.id,
            name: task.name || task.title,
            start: new Date(task.start).getTime(),
            end: new Date(task.end).getTime(),
            progress: task.progress,
            startPosition: 0,
            duration: Math.ceil((new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)) + 1
          }))}
          dateRange={dateRange}
          isLoading={loading || isLoading}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </MainLayout>
  );
};

export default GanttChart;
