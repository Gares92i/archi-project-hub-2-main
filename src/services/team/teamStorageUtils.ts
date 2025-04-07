
import { TeamMember } from "./legacyTeamService";

const STORAGE_KEY = 'team_members';

// Charger les membres de l'équipe depuis localStorage
export const loadTeamMembersFromStorage = (): TeamMember[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return [];
  } catch (error) {
    console.error("Erreur lors du chargement des membres depuis localStorage:", error);
    return [];
  }
};

// Sauvegarder les membres de l'équipe dans localStorage
export const saveTeamMembersToStorage = (members: TeamMember[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des membres dans localStorage:", error);
  }
};

// Données par défaut pour les membres de l'équipe
export const getDefaultTeamMembers = (): TeamMember[] => [
  {
    id: "1",
    name: "Sophie Martin",
    role: "architect",
    email: "sophie.martin@exemple.fr",
    phone: "01 23 45 67 89",
    projects: ["1", "2"],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "active"
  },
  {
    id: "2",
    name: "Thomas Dubois",
    role: "engineer",
    email: "thomas.dubois@exemple.fr",
    phone: "01 98 76 54 32",
    projects: ["1"],
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    status: "busy"
  },
  {
    id: "3",
    name: "Emma Legrand",
    role: "designer",
    email: "emma.legrand@exemple.fr",
    phone: "01 45 67 89 10",
    projects: ["3"],
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    status: "active"
  },
  {
    id: "4",
    name: "Lucas Bernard",
    role: "architect",
    email: "lucas.bernard@exemple.fr",
    phone: "01 56 78 91 23",
    projects: ["2"],
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "offline"
  },
  {
    id: "5",
    name: "Camille Leroy",
    role: "engineer",
    email: "camille.leroy@exemple.fr",
    phone: "01 67 89 12 34",
    projects: ["1", "3"],
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "active"
  }
];
