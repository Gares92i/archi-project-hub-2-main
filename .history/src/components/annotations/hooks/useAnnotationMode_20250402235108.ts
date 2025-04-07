import { useState, useCallback } from 'react';

interface UseAnnotationModeProps {
  stopPanning: () => void;
  isPanning: boolean;
}

export const useAnnotationMode = ({ stopPanning, isPanning }: UseAnnotationModeProps) => {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  const handleToggleAddAnnotation = useCallback(() => {
    if (isPanning) {
      stopPanning();
    }
    setIsAddingAnnotation(prev => !prev);
  }, [isPanning, stopPanning]);

  return { isAddingAnnotation, setIsAddingAnnotation, handleToggleAddAnnotation };
};
