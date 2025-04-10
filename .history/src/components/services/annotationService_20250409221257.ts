import { Annotation, Document } from "@/components/annotations/types";

// Fonction pour récupérer les annotations d'un projet
export const getProjectAnnotations = async (projectId: string): Promise<Annotation[]> => {
  try {
    // Récupérer les données stockées localement
    const storedData = localStorage.getItem(`project-annotations-${projectId}`);
    
    if (!storedData) {
      console.log(`Aucune annotation trouvée pour le projet ${projectId}`);
      return [];
    }

    const documents: Document[] = JSON.parse(storedData);

    // Extraire toutes les annotations de tous les documents
    const allAnnotations = documents.flatMap(doc =>
      doc.annotations?.map(ann => ({
        ...ann,
        documentId: doc.id,
        documentName: doc.name
      })) || []
    );
    
    console.log(`${allAnnotations.length} annotations trouvées pour le projet ${projectId}`);
    return allAnnotations;
  } catch (error) {
    console.error("Erreur lors de la récupération des annotations:", error);
    return [];
  }
};

// Fonction pour récupérer les documents avec annotations d'un projet
export const getProjectDocuments = async (projectId: string): Promise<Document[]> => {
  try {
    // Récupérer les données stockées localement
    const storedData = localStorage.getItem(`project-annotations-${projectId}`);
    
    if (!storedData) {
      return [];
    }
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
};

// Fonction pour filtrer les annotations non résolues
export const getUnresolvedAnnotations = async (projectId: string): Promise<Annotation[]> => {
  const annotations = await getProjectAnnotations(projectId);
  return annotations.filter(ann => !ann.resolved && !ann.isResolved);
};

// Fonction pour mettre à jour une annotation
export const updateAnnotation = async (
  projectId: string,
  annotationId: string,
  data: Partial<Annotation>
): Promise<boolean> => {
  try {
    const documents = await getProjectDocuments(projectId);
    
    let updated = false;
    const updatedDocuments = documents.map(doc => {
      if (!doc.annotations) return doc;
      
      const updatedAnnotations = doc.annotations.map(ann => {
        if (ann.id === annotationId) {
          updated = true;
          return { ...ann, ...data };
        }
        return ann;
      });
      
      return { ...doc, annotations: updatedAnnotations };
    });
    
    if (updated) {
      localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));
    }
    
    return updated;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annotation:", error);
    return false;
  }
};

// Fonctions supplémentaires qui pourraient être utiles

// Ajouter une annotation à un document
export const addAnnotationToDocument = async (
  projectId: string,
  documentId: string,
  annotation: Omit<Annotation, 'id'>
): Promise<string | null> => {
  try {
    const documents = await getProjectDocuments(projectId);
    const docIndex = documents.findIndex(doc => doc.id === documentId);
    
    if (docIndex === -1) return null;
    
    // Générer un ID unique pour la nouvelle annotation
    const newAnnotationId = `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newAnnotation: Annotation = {
      id: newAnnotationId,
      ...annotation,
    };
    
    const updatedDocuments = [...documents];
    const document = updatedDocuments[docIndex];
    
    updatedDocuments[docIndex] = {
      ...document,
      annotations: [...(document.annotations || []), newAnnotation],
    };
    
    localStorage.setItem(`project-annotations-${projectId}`, JSON.stringify(updatedDocuments));
    
    return newAnnotationId;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'annotation:", error);
    return null;
  }
};

// Fonction pour compter les annotations par statut
export const countAnnotationsByStatus = async (projectId: string): Promise<{
  total: number;
  resolved: number;
  unresolved: number;
}> => {
  const annotations = await getProjectAnnotations(projectId);
  const total = annotations.length;
  const resolved = annotations.filter(ann => ann.resolved || ann.isResolved).length;
  
  return {
    total,
    resolved,
    unresolved: total - resolved
  };
};