import { useCallback } from 'react';

interface UseZoomProps {
  setZoom: (value: number | ((prev: number) => number)) => void;
}

export const useZoom = ({ setZoom }: UseZoomProps) => {
  const handleZoomIn = useCallback(() => {
    setZoom((prev: number) => Math.min(prev * 1.2, 5));
  }, [setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, [setZoom]);

  return { handleZoomIn, handleZoomOut };
};
