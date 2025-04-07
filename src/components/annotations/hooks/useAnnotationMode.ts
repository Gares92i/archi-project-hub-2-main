
import { useState, useCallback } from 'react';

interface UseAnnotationModeProps {
  stopPanning: () => void;
  isPanning: boolean;
}

export const useAnnotationMode = ({ stopPanning, isPanning }: UseAnnotationModeProps) => {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  const handleToggleAddAnnotation = useCallback(() => {
    setIsAddingAnnotation(prev => !prev);
    if (isPanning) {
      stopPanning();
    }
  }, [isPanning, stopPanning]);

  return {
    isAddingAnnotation,
    setIsAddingAnnotation,
    handleToggleAddAnnotation
  };
};
