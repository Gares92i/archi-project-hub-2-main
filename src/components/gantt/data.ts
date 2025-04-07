
import { Project } from "./types";

export const projectsData: Project[] = [
  {
    id: "1",
    name: "Résidence Les Ormes",
    tasks: [
      { id: "1-1", title: "Conception", name: "Conception", start: "2023-08-01", end: "2023-09-15", progress: 100 },
      { id: "1-2", title: "Permis de construire", name: "Permis de construire", start: "2023-09-10", end: "2023-11-20", progress: 80 },
      { id: "1-3", title: "Terrassement", name: "Terrassement", start: "2023-11-15", end: "2023-12-15", progress: 60 },
      { id: "1-4", title: "Fondations", name: "Fondations", start: "2023-12-10", end: "2024-01-15", progress: 40 },
      { id: "1-5", title: "Gros œuvre", name: "Gros œuvre", start: "2024-01-10", end: "2024-03-15", progress: 10 },
      { id: "1-6", title: "Second œuvre", name: "Second œuvre", start: "2024-03-10", end: "2024-05-30", progress: 0 },
    ]
  },
  {
    id: "2",
    name: "Tour Horizon",
    tasks: [
      { id: "2-1", title: "Études préliminaires", name: "Études préliminaires", start: "2023-06-15", end: "2023-08-30", progress: 100 },
      { id: "2-2", title: "Conception détaillée", name: "Conception détaillée", start: "2023-08-15", end: "2023-11-30", progress: 90 },
      { id: "2-3", title: "Autorisations", name: "Autorisations", start: "2023-11-15", end: "2024-03-20", progress: 70 },
      { id: "2-4", title: "Construction phase 1", name: "Construction phase 1", start: "2024-03-15", end: "2024-07-30", progress: 20 },
      { id: "2-5", title: "Construction phase 2", name: "Construction phase 2", start: "2024-07-15", end: "2024-12-30", progress: 0 },
    ]
  },
  {
    id: "3",
    name: "Éco-quartier Rivière",
    tasks: [
      { id: "3-1", title: "Planification urbaine", name: "Planification urbaine", start: "2023-07-01", end: "2023-10-15", progress: 100 },
      { id: "3-2", title: "Études environnementales", name: "Études environnementales", start: "2023-10-01", end: "2024-01-30", progress: 85 },
      { id: "3-3", title: "Infrastructure", name: "Infrastructure", start: "2024-01-15", end: "2024-05-30", progress: 45 },
      { id: "3-4", title: "Construction des logements", name: "Construction des logements", start: "2024-05-15", end: "2025-02-28", progress: 10 },
    ]
  }
];
