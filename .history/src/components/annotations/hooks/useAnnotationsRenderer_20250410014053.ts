import { useEffect, useCallback, useRef } from 'react';
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
  addAnnotation: (annotation: Annotation, options?: fabric.ICircleOptions) => fabric.Circle | undefined;
}

export const useAnnotationsRenderer = ({
  annotations,
  selectedAnnotation,
  isInitialized,
  canvas,
  onAnnotationClick
}: UseAnnotationsRendererProps) => {
  // Garder une référence aux objets d'annotation pour pouvoir les mettre à jour
  const annotationObjects = useRef<Record<string, fabric.Circle>>({});

  // Mettre à jour les objets d'annotation
  const setAnnotationObjects = useCallback((objects: Record<string, fabric.Circle>) => {
    annotationObjects.current = objects;
  }, []);

  // Effet pour rendre les annotations
  useEffect(() => {
    if (!canvas || !isInitialized) return;

    // Supprimer les anciennes annotations
    Object.values(annotationObjects.current).forEach(obj => {
      if (canvas.contains(obj)) {
        canvas.remove(obj);
      }
    });
   const addAnnotation = (annotation: Annotation, options?: fabric.ICircleOptions): fabric.Circle | undefined => {
  // implementation here
};
    const newAnnotationObjects: Record<string, fabric.Circle> = {};

    // Ajouter les nouvelles annotations
    annotations.forEach(annotation => {
      const isSelected = selectedAnnotation?.id === annotation.id;

      const circle = new fabric.Circle({
        left: annotation.x - 10,
        top: annotation.y - 10,
        radius: isSelected ? 12 : 10,
        fill: annotation.resolved ? 'green' : 'red',
        stroke: isSelected ? 'yellow' : 'white',
        strokeWidth: isSelected ? 3 : 2,
        selectable: false,
        data: { type: 'annotation', id: annotation.id }
      });

      if (onAnnotationClick) {
        circle.on('mousedown', () => {
          onAnnotationClick(annotation);
        });
      }

      canvas.add(circle);
      newAnnotationObjects[annotation.id] = circle;
    });

    setAnnotationObjects(newAnnotationObjects);
    canvas.renderAll();

  }, [canvas, isInitialized, annotations, selectedAnnotation, onAnnotationClick, setAnnotationObjects]);

  return { setAnnotationObjects };
};
