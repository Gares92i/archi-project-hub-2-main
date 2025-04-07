
import { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Annotation } from '../types';

interface UseAnnotationsRendererProps {
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  isInitialized: boolean;
  canvas: fabric.Canvas | null;
  isAddingAnnotation: boolean;
  isPanning: boolean;
  onAnnotationClick?: (annotation: Annotation) => void;
  addAnnotation: (annotation: Annotation, isSelected: boolean, onClick: () => void) => fabric.Object | null;
}

export const useAnnotationsRenderer = ({
  annotations,
  selectedAnnotation,
  isInitialized,
  canvas,
  isAddingAnnotation,
  isPanning,
  onAnnotationClick,
  addAnnotation
}: UseAnnotationsRendererProps) => {
  const [annotationObjects, setAnnotationObjects] = useState<Record<string, fabric.Object>>({});

  // Update annotations on the canvas
  useEffect(() => {
    if (!isInitialized || !canvas) return;
    
    // Clean up old annotations
    const oldAnnotationObjects = { ...annotationObjects };
    Object.values(oldAnnotationObjects).forEach(obj => {
      if (canvas.contains(obj)) {
        canvas.remove(obj);
      }
    });
    
    // Create new annotations
    const newAnnotationObjects: Record<string, fabric.Object> = {};
    
    annotations.forEach(annotation => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      const onClick = () => {
        if (!isAddingAnnotation && !isPanning && onAnnotationClick) {
          onAnnotationClick(annotation);
        }
      };
      
      const annotationObject = addAnnotation(annotation, isSelected, onClick);
      if (annotationObject) {
        newAnnotationObjects[annotation.id] = annotationObject;
      }
    });
    
    setAnnotationObjects(newAnnotationObjects);
    
    // Ensure new annotations are rendered
    canvas.requestRenderAll();
    
  }, [annotations, selectedAnnotation, isInitialized, canvas, isAddingAnnotation, isPanning, onAnnotationClick, addAnnotation]);

  return {
    annotationObjects,
    setAnnotationObjects
  };
};
