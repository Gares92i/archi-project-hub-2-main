import React from 'react';

interface CanvasContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  isPanning: boolean;
  isDragging: boolean;
}

export const CanvasContainer = React.forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ children, isLoading, isPanning, isDragging }, ref) => {
    return (
      <div 
        ref={ref}
        className="flex-1 relative overflow-hidden"
        style={{ 
          cursor: isPanning 
            ? isDragging ? 'grabbing' : 'grab' 
            : 'default'
        }}
      >
        {children}
      </div>
    );
  }
);

CanvasContainer.displayName = 'CanvasContainer';
