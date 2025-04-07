
import { toast } from "sonner";

// Type pour les clients
export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  projectIds: string[]; // IDs des projets liés à ce client
}

// Récupérer les clients du localStorage ou utiliser les données par défaut
const loadClientsFromStorage = (): ClientData[] => {
  const savedClients = localStorage.getItem('clientsData');
  if (savedClients) {
    try {
      return JSON.parse(savedClients);
    } catch (error) {
      console.error("Erreur lors du chargement des clients depuis localStorage:", error);
      return getDefaultClients();
    }
  }
  return getDefaultClients();
};

// Sauvegarder les clients dans localStorage
const saveClientsToStorage = (clients: ClientData[]) => {
  localStorage.setItem('clientsData', JSON.stringify(clients));
};

// Données par défaut pour les clients
const getDefaultClients = (): ClientData[] => [
  {
    id: "1",
    name: "Société Immobilière Provence",
    email: "contact@siprovence.fr",
    phone: "04 91 XX XX XX",
    address: "123 Avenue de la Méditerranée, 13000 Marseille",
    company: "SIP",
    projectIds: ["1"]
  },
  {
    id: "2",
    name: "Groupe Altitude Développement",
    email: "info@altitudedeveloppement.fr",
    phone: "04 72 XX XX XX",
    address: "45 Rue de la République, 69002 Lyon",
    company: "Altitude Dev",
    projectIds: ["2"]
  }
];

// Initialiser les clients depuis localStorage ou utiliser les données par défaut
let clientsData: ClientData[] = loadClientsFromStorage();

// Récupérer tous les clients
export const getAllClients = async (): Promise<ClientData[]> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Clients récupérés:", clientsData.length);
      resolve([...clientsData]); // Retourne une copie pour éviter les problèmes de référence
    }, 300);
  });
};

// Récupérer un client par ID
export const getClientById = async (id: string): Promise<ClientData | null> => {
  // Simulation d'un appel API
  return new Promise((resolve) => {
    const client = clientsData.find(c => c.id === id);
    setTimeout(() => resolve(client ? {...client} : null), 300); // Retourne une copie
  });
};

// Ajouter un nouveau client
export const addClient = async (client: Omit<ClientData, "id">): Promise<ClientData> => {
  const newClient: ClientData = {
    ...client,
    id: Date.now().toString(), // Génération d'un ID unique
  };
  
  console.log("Ajout d'un nouveau client:", newClient);
  
  clientsData = [...clientsData, newClient];
  saveClientsToStorage(clientsData); // Sauvegarder dans localStorage
  
  toast.success(`Client "${newClient.name}" créé avec succès`);
  
  return {...newClient}; // Retourne une copie
};

// Mettre à jour un client existant
export const updateClient = async (id: string, updates: Partial<ClientData>): Promise<ClientData> => {
  const clientIndex = clientsData.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    throw new Error(`Client avec l'ID ${id} non trouvé`);
  }
  
  const oldClient = clientsData[clientIndex];
  const updatedClient = { ...oldClient, ...updates };
  
  clientsData = [
    ...clientsData.slice(0, clientIndex),
    updatedClient,
    ...clientsData.slice(clientIndex + 1)
  ];
  
  saveClientsToStorage(clientsData); // Sauvegarder dans localStorage
  
  console.log("Client mis à jour:", updatedClient);
  toast.success(`Client "${updatedClient.name}" mis à jour avec succès`);
  return {...updatedClient}; // Retourne une copie
};

// Supprimer un client
export const deleteClient = async (id: string): Promise<boolean> => {
  const clientIndex = clientsData.findIndex(client => client.id === id);
  
  if (clientIndex === -1) {
    throw new Error(`Client avec l'ID ${id} non trouvé`);
  }
  
  const client = clientsData[clientIndex];
  const clientName = client.name;
  
  clientsData = [
    ...clientsData.slice(0, clientIndex),
    ...clientsData.slice(clientIndex + 1)
  ];
  
  saveClientsToStorage(clientsData); // Sauvegarder dans localStorage
  
  console.log(`Client "${clientName}" supprimé`);
  toast.success(`Client "${clientName}" supprimé avec succès`);
  return true;
};

// Ajouter un projet à un client
export const addProjectToClient = async (clientId: string, projectId: string): Promise<boolean> => {
  const clientIndex = clientsData.findIndex(client => client.id === clientId);
  
  if (clientIndex === -1) {
    console.error(`Client avec l'ID ${clientId} non trouvé`);
    return false;
  }
  
  const client = clientsData[clientIndex];
  
  // Vérifier si le projet est déjà dans la liste
  if (client.projectIds?.includes(projectId)) {
    return true; // Le projet est déjà associé à ce client
  }
  
  // Ajouter le projet au client
  const updatedClient = {
    ...client,
    projectIds: [...(client.projectIds || []), projectId]
  };
  
  clientsData = [
    ...clientsData.slice(0, clientIndex),
    updatedClient,
    ...clientsData.slice(clientIndex + 1)
  ];
  
  saveClientsToStorage(clientsData);
  return true;
};

// Supprimer un projet d'un client
export const removeProjectFromClient = async (clientId: string, projectId: string): Promise<boolean> => {
  const clientIndex = clientsData.findIndex(client => client.id === clientId);
  
  if (clientIndex === -1) {
    console.error(`Client avec l'ID ${clientId} non trouvé`);
    return false;
  }
  
  const client = clientsData[clientIndex];
  
  // Supprimer le projet de la liste
  const updatedClient = {
    ...client,
    projectIds: (client.projectIds || []).filter(id => id !== projectId)
  };
  
  clientsData = [
    ...clientsData.slice(0, clientIndex),
    updatedClient,
    ...clientsData.slice(clientIndex + 1)
  ];
  
  saveClientsToStorage(clientsData);
  return true;
};
