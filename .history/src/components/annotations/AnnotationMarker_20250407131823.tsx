import React from "react";
import { cn } from "@/lib/utils";

interface AnnotationMarkerProps {
  x: number;
  y: number;
  selected?: boolean;
  resolved?: boolean;
  annotationNumber: number; // Ajout du numéro d'annotation
  onClick?: () => void;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  x,
  y,
  selected = false,
  resolved = false,
  annotationNumber, // Ajout du numéro d'annotation
  onClick,
}) => {
  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all",
        "border-2 select-none",
        selected
          ? "w-7 h-7 bg-primary text-primary-foreground border-primary z-20"
          : "w-6 h-6 border-orange-500 bg-orange-100 text-orange-800 z-10 hover:z-20 hover:scale-110",
        resolved && !selected && "border-green-500 bg-green-100 text-green-800"
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={onClick}
    >
      <span className="text-xs font-bold">{annotationNumber}</span>
    </div>
  );
};