
import { useCallback } from 'react';

interface UsePanningModeProps {
  isPanning: boolean;
  startPanning: () => void;
  stopPanning: () => void;
  setIsAddingAnnotation: (value: boolean) => void;
}

export const usePanningMode = ({
  isPanning,
  startPanning,
  stopPanning,
  setIsAddingAnnotation
}: UsePanningModeProps) => {
  const handleTogglePanning = useCallback(() => {
    if (isPanning) {
      stopPanning();
    } else {
      startPanning();
      setIsAddingAnnotation(false);
    }
  }, [isPanning, startPanning, stopPanning, setIsAddingAnnotation]);

  return {
    handleTogglePanning
  };
};
