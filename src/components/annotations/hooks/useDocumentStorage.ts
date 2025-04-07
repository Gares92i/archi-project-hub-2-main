import { useState, useEffect } from 'react';
import { Document } from '../types';

const STORAGE_KEY = 'project_documents_';

export const useDocumentStorage = (projectId: string) => {
  const storageKey = `${STORAGE_KEY}${projectId}`;
  
  const loadDocuments = (): Document[] => {
    try {
      const storedDocuments = localStorage.getItem(storageKey);
      if (storedDocuments) {
        return JSON.parse(storedDocuments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    }
    return [];
  };
  
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());
  
  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(documents));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des documents:', error);
    }
  }, [documents, storageKey]);
  
  return { documents, setDocuments };
};