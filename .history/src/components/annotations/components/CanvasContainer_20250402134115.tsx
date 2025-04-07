
import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  isPanning: boolean;
  isDragging: boolean;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  isLoading,
  isPanning,
  isDragging
}) => {
  return (
    <div className="relative flex-grow overflow-hidden border rounded-md">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      <div 
        className={cn(
          "w-full h-full",
          isPanning ? "cursor-grab" : "cursor-default",
          isDragging ? "cursor-grabbing" : ""
        )}
      >
        {children}
      </div>
    </div>
  );
};
