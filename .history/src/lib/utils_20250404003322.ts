import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fonction existante
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ajoutez cette nouvelle fonction
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    
    // Format: JJ/MM/YYYY HH:MM
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "Erreur de date";
  }
}
