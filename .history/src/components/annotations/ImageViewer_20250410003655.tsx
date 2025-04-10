import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageViewerProps {
  url: string;
  scale?: number;
  rotation?: number;
  onScaleChange?: (scale: number) => void;
  onRotationChange?: (rotation: number) => void;
  hideControls?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  scale: externalScale,
  rotation: externalRotation,
  onScaleChange,
  onRotationChange,
  hideControls = false
}) => {
  const [scale, setScale] = useState(externalScale || 1);
  const [rotation, setRotation] = useState(externalRotation || 0);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchroniser l'état interne avec les props externes
  useEffect(() => {
    if (externalScale !== undefined && externalScale !== scale) {
      setScale(externalScale);
    }
  }, [externalScale, scale]);

  useEffect(() => {
    if (externalRotation !== undefined && externalRotation !== rotation) {
      setRotation(externalRotation);
    }
  }, [externalRotation, rotation]);

  // Réinitialiser l'état lorsque l'URL change
  useEffect(() => {
    setIsLoading(true);
    // Ne pas réinitialiser le zoom et la rotation ici, car ils sont contrôlés par le parent
  }, [url]);

  // Fonctions de zoom
  const zoomIn = () => {
    const newScale = Math.min(scale + 0.1, 3);
    setScale(newScale);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5);
    setScale(newScale);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  // Fonction de rotation
  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (onRotationChange) {
      onRotationChange(newRotation);
    }
  };
  
  // Fonction de réinitialisation
  const reset = () => {
    const defaultScale = 1;
    const defaultRotation = 0;
    setScale(defaultScale);
    setRotation(defaultRotation);
    if (onScaleChange) onScaleChange(defaultScale);
    if (onRotationChange) onRotationChange(defaultRotation);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error("Erreur lors du chargement de l'image");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils - affichée uniquement si hideControls est false */}
      {!hideControls && (
        <div className="bg-muted/50 p-2 flex flex-wrap items-center justify-end gap-2 border-t border-b">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={rotate}
              className="h-8 w-8 p-0"
              title="Rotation"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="h-8 w-8 p-0"
              title="Réinitialiser"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Container pour l'image */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto flex items-center justify-center"
      >
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <Skeleton className="h-[80%] w-[80%] max-w-2xl" />
          </div>
        )}

        <div 
          className="relative transition-all duration-200 ease-in-out transform origin-center"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            ref={imageRef}
            src={url}
            alt="Document"
            className={`max-w-full h-auto transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>
    </div>
  );
};