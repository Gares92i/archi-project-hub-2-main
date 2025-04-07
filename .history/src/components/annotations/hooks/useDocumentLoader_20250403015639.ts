
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseDocumentLoaderProps {
  isInitialized: boolean;
  canvas: fabric.Canvas | null;
  addImage: (url: string, width: number, height: number) => Promise<void>;
  canvasSize: { width: number; height: number };
}

export const useDocumentLoader = ({
  isInitialized,
  canvas,
  addImage,
  canvasSize
}: UseDocumentLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const documentUrlRef = useRef<string>('');

  const loadDocument = useCallback(async (url: string) => {
    if (!isInitialized || !canvas) return;
    
    // Avoid reloading the same document
    if (documentUrlRef.current === url) return;
    documentUrlRef.current = url;
    
    setIsLoading(true);
    
    try {
      await addImage(url, canvasSize.width, canvasSize.height);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
      setIsLoading(false);
      toast.error("Erreur lors du chargement du document");
    }
  }, [isInitialized, canvas, addImage, canvasSize]);

  return {
    isLoading,
    setIsLoading,
    loadDocument,
    documentUrlRef
  };
};
