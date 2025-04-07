import React from "react";
import { cn } from "@/lib/utils";

interface AnnotationMarkerProps {
  x: number;
  y: number;
  selected?: boolean;
  resolved?: boolean;
  annotationNumber: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  scaleWithZoom?: boolean; // Nouveau prop pour contrôler si le marqueur garde sa taille pendant le zoom
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  x,
  y,
  selected = false,
  resolved = false,
  annotationNumber,
  onClick,
  className = "",
  scaleWithZoom = false,
}) => {
  // Validons que x et y sont des nombres valides entre 0 et 100
  const validX = typeof x === 'number' && !isNaN(x) ? Math.min(Math.max(x, 0), 100) : 0;
  const validY = typeof y === 'number' && !isNaN(y) ? Math.min(Math.max(y, 0), 100) : 0;
  
  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all",
        "border-2 select-none",
        selected
          ? "w-7 h-7 bg-primary text-primary-foreground border-primary z-20"
          : "w-6 h-6 border-orange-500 bg-orange-100 text-orange-800 z-10 hover:z-20 hover:scale-110",
        resolved && !selected && "border-green-500 bg-green-100 text-green-800",
        className,
        // Si scaleWithZoom est true, ajouter cette classe qui contre-balance l'effet de zoom
        scaleWithZoom && "zoom-invariant"
      )}
      style={{
        left: `${validX}%`,
        top: `${validY}%`,
        // Si scaleWithZoom est true, cela aidera les annotations à garder leur taille apparente
        transformOrigin: 'center center',
      }}
      onClick={onClick}
    >
      <span className="text-xs font-bold">{annotationNumber}</span>
    </div>
  );
};