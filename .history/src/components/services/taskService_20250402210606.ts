import { Task } from "../annotations/types";
import { toast } from "sonner";

// Simulation d'une base de données en mémoire
let tasksData: Task[] = [
  {
    id: "1",
    title: "Finaliser les plans d'étage pour Villa Moderna",
    name: "Finaliser les plans d'étage",
    projectName: "Villa Moderna",
    projectId: "1",
    dueDate: "2023-06-30",
    start: "2023-06-25",
    end: "2023-06-30",
    priority: "high",
    completed: false,
    progress: 0.6,
  },
  {
    id: "2",
    title: "Réviser le cahier des charges pour Tour Horizon",
    name: "Réviser le cahier des charges",
    projectName: "Tour Horizon",
    projectId: "2",
    dueDate: "2023-06-25",
    start: "2023-06-20",
    end: "2023-06-25",
    priority: "medium",
    completed: false,
    progress: 0.4,
  },
  {
    id: "3",
    title: "Préparer la présentation client pour Résidence Eterna",
    name: "Préparer la présentation client",
    projectName: "Résidence Eterna",
    projectId: "3",
    dueDate: "2023-06-24",
    start: "2023-06-20",
    end: "2023-06-24",
    priority: "low",
    completed: true,
    progress: 1.0,
  },
  {
    id: "4",
    title: "Soumettre les permis de construire pour Centre Commercial Lumina",
    name: "Soumettre les permis de construire",
    projectName: "Centre Commercial Lumina",
    projectId: "4",
    dueDate: "2023-06-28",
    start: "2023-06-15",
    end: "2023-06-28",
    priority: "high",
    completed: false,
    progress: 0.3,
  },
  {
    id: "5",
    title: "Étudier les contraintes du terrain pour Bureaux Panorama",
    name: "Étudier les contraintes du terrain",
    projectName: "Bureaux Panorama",
    projectId: "5",
    dueDate: "2023-07-05",
    start: "2023-06-25",
    end: "2023-07-05",
    priority: "medium",
    completed: false,
    progress: 0.2,
  },
  {
    id: "6",
    title: "Coordonner avec l'ingénieur structure pour École Futura",
    name: "Coordonner avec l'ingénieur structure",
    projectName: "École Futura",
    projectId: "6",
    dueDate: "2023-07-10",
    start: "2023-07-01",
    end: "2023-07-10",
    priority: "high",
    completed: false,
    progress: 0.1,
  },
  {
    id: "7",
    title: "Analyser les devis des sous-traitants pour Hôtel Riviera",
    name: "Analyser les devis des sous-traitants",
    projectName: "Hôtel Riviera",
    projectId: "7",
    dueDate: "2023-07-02",
    start: "2023-06-25",
    end: "2023-07-02",
    priority: "medium",
    completed: false,
    progress: 0.5,
  },
  {
    id: "8",
    title: "Finaliser les plans de plomberie pour Villa Moderna",
    name: "Finaliser les plans de plomberie",
    projectName: "Villa Moderna",
    projectId: "1",
    dueDate: "2023-06-29",
    start: "2023-06-22",
    end: "2023-06-29",
    priority: "low",
    completed: false,
    progress: 0.7,
  },
  {
    id: "9",
    title: "Valider les choix de matériaux pour Tour Horizon",
    name: "Valider les choix de matériaux",
    projectName: "Tour Horizon",
    projectId: "2",
    dueDate: "2023-07-08",
    start: "2023-07-01",
    end: "2023-07-08",
    priority: "medium",
    completed: false,
    progress: 0.2,
  },
  {
    id: "10",
    title: "Ajuster le planning prévisionnel pour Résidence Eterna",
    name: "Ajuster le planning prévisionnel",
    projectName: "Résidence Eterna",
    projectId: "3",
    dueDate: "2023-06-26",
    start: "2023-06-20",
    end: "2023-06-26",
    priority: "high",
    completed: false,
    progress: 0.8,
  },
  {
    id: "11",
    title: "Mettre à jour les rendus 3D pour Villa Moderna",
    name: "Mettre à jour les rendus 3D",
    projectName: "Villa Moderna",
    projectId: "1",
    dueDate: "2023-07-15",
    start: "2023-07-05",
    end: "2023-07-15",
    priority: "medium",
    completed: false,
    progress: 0.1,
  },
  {
    id: "12",
    title: "Finaliser le dossier administratif de Complexe Sportif Olympia",
    name: "Finaliser le dossier administratif",
    projectName: "Complexe Sportif Olympia",
    projectId: "8",
    dueDate: "2023-07-03",
    start: "2023-06-25",
    end: "2023-07-03",
    priority: "high",
    completed: false,
    progress: 0.4,
  },
];

// Récupérer toutes les tâches
export const getAllTasks = async (): Promise<Task[]> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    setTimeout(() => resolve(tasksData), 300);
  });
};

// Récupérer les tâches par ID de projet
export const getTasksByProjectId = async (projectId: string): Promise<Task[]> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    const filteredTasks = tasksData.filter((task) => task.projectId === projectId);
    setTimeout(() => resolve(filteredTasks), 300);
  });
};

/**
 * Fonction pour ajouter une nouvelle tâche
 */
export const addTask = async (taskData: Omit<Task, "id">): Promise<string> => {
  try {
    // Simuler une API call avec délai
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Générer un ID unique pour la tâche
    const id = `task_${Date.now()}`;

    // Simuler le stockage de la tâche
    console.log("Nouvelle tâche créée:", { id, ...taskData });

    // Retourner l'ID de la nouvelle tâche
    return id;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche:", error);
    throw new Error("Échec de l'ajout de la tâche");
  }
};

/**
 * Fonction pour récupérer les détails d'une tâche
 */
export const getTask = async (taskId: string): Promise<Task | null> => {
  try {
    // Simuler une API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Retourner une tâche fictive
    return {
      id: taskId,
      title: "Tâche exemple",
      description: "Description de la tâche exemple",
      projectId: "1",
      projectName: "Projet exemple",
      dueDate: new Date().toISOString().split("T")[0],
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priority: "medium",
      completed: false,
      progress: 0,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche:", error);
    return null;
  }
};

// Mettre à jour une tâche existante
export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const taskIndex = tasksData.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    throw new Error(`Tâche avec l'ID ${id} non trouvée`);
  }

  const updatedTask = { ...tasksData[taskIndex], ...updates };
  tasksData = [...tasksData.slice(0, taskIndex), updatedTask, ...tasksData.slice(taskIndex + 1)];

  toast.success(`Tâche mise à jour avec succès`);
  return updatedTask;
};

// Supprimer une tâche
export const deleteTask = async (id: string): Promise<boolean> => {
  const taskIndex = tasksData.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    throw new Error(`Tâche avec l'ID ${id} non trouvée`);
  }

  tasksData = [...tasksData.slice(0, taskIndex), ...tasksData.slice(taskIndex + 1)];

  toast.success(`Tâche supprimée avec succès`);
  return true;
};

// Mettre à jour le statut de complétion d'une tâche
export const toggleTaskCompletion = async (id: string, completed: boolean): Promise<Task> => {
  return updateTask(id, { completed });
};

// Mettre à jour les dates d'une tâche (pour le Gantt)
export const updateTaskDates = async (id: string, startDate: Date, endDate: Date): Promise<Task> => {
  // Format the dates to ISO string and extract the date part
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  return updateTask(id, {
    start,
    end,
    dueDate: end,
  });
};
