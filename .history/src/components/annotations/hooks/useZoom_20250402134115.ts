
import { useState, useCallback } from 'react';

interface UseZoomProps {
  setZoom: (zoom: number) => void;
  initialZoom?: number;
}

export const useZoom = ({ setZoom, initialZoom = 1 }: UseZoomProps) => {
  const [zoomValue, setZoomValue] = useState(initialZoom);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomValue + 0.1, 3);
    setZoomValue(newZoom);
    setZoom(newZoom);
  }, [zoomValue, setZoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomValue - 0.1, 0.2);
    setZoomValue(newZoom);
    setZoom(newZoom);
  }, [zoomValue, setZoom]);

  return {
    zoom: zoomValue,
    setZoomValue,
    handleZoomIn,
    handleZoomOut
  };
};
