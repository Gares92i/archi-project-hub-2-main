import { useRef, useState, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { toast } from 'sonner';

interface UseDocumentLoaderProps {
  isInitialized: boolean;
  canvas: fabric.Canvas | null;
  addImage: (imageUrl: string, callback?: () => void) => void;
  canvasSize: { width: number; height: number };
}

export const useDocumentLoader = ({ 
  isInitialized, 
  canvas, 
  addImage, 
  canvasSize 
}: UseDocumentLoaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const documentUrlRef = useRef('');

  // Fonction pour charger un document
  const loadDocument = useCallback((url: string) => {
    if (!isInitialized || !canvas) return;

    // Si c'est la même URL et qu'elle est déjà chargée, ignorer
    if (documentUrlRef.current === url) return;

    documentUrlRef.current = url;
    setIsLoading(true);

    try {
      addImage(url, () => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Erreur lors du chargement du document:', error);
      toast.error('Erreur lors du chargement du document');
      setIsLoading(false);
    }
  }, [isInitialized, canvas, addImage]);

  // Adapter le canvas quand la taille change
  useEffect(() => {
    if (!canvas || !isInitialized) return;

    canvas.setDimensions({
      width: canvasSize.width,
      height: canvasSize.height
    });
    
    // Recharger le document actuel si nécessaire
    if (documentUrlRef.current) {
      addImage(documentUrlRef.current);
    }
  }, [canvasSize, canvas, isInitialized, addImage]);

  return { isLoading, loadDocument, documentUrlRef };
};
