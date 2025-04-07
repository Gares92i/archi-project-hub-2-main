import { Task, ConvertToTaskData, formatDateToISOString, validatePriority } from '../types';

export const useTaskCreation = () => {
  const addTask = async (taskData: Omit<Task, "id">): Promise<Task> => {
    // Implémentation de l'ajout de tâche
    // ...
    
    // Retourne la nouvelle tâche avec un ID généré
    return { id: Date.now().toString(), ...taskData };
  };
  
  const handleConvertAnnotationToTask = async (
    annotation: Annotation,
    taskData: ConvertToTaskData
  ): Promise<Task> => {
    try {
      // Conversion des données pour respecter les types
      const newTask = await addTask({
        title: taskData.title,
        name: taskData.title,
        description: taskData.description || annotation.comment,
        projectId: taskData.projectId,
        projectName: taskData.projectName || "Projet d'exemple",
        assigneeId: taskData.assigneeId,
        dueDate: formatDateToISOString(taskData.dueDate),
        start: formatDateToISOString(new Date()),
        end: formatDateToISOString(taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        priority: validatePriority(taskData.priority),
        completed: taskData.completed || false,
        progress: taskData.progress || 0
      });
      
      return newTask;
    } catch (error) {
      console.error("Erreur lors de la conversion de l'annotation en tâche:", error);
      throw error;
    }
  };
  
  return { addTask, handleConvertAnnotationToTask };
};