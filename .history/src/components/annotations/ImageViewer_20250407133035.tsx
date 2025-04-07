import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageViewerProps {
  url: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ url }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Réinitialiser l'état lorsque l'URL change
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setIsLoading(true);
  }, [url]);

  // Fonctions de zoom
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Fonction de rotation
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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
      {/* Barre d'outils */}
      <div className="bg-muted/50 p-2 flex flex-wrap items-center justify-end gap-2 border-t border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="h-8 w-8 p-0"
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
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={rotate}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Container pour l'image */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto flex items-center justify-center"
      >
        {isLoading && (
          <Skeleton className="h-[80%] w-[80%] max-w-2xl" />
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