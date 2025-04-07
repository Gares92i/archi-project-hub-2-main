
import { fabric } from 'fabric';

/**
 * Creates an annotation circle
 */
export const createAnnotationCircle = (isSelected: boolean): fabric.Circle => {
  return new fabric.Circle({
    radius: 16,
    fill: isSelected ? '#ff4d4f' : '#ff8f1f',
    originX: 'center',
    originY: 'center',
    stroke: '#fff',
    strokeWidth: 2,
  });
};

/**
 * Creates annotation text
 */
export const createAnnotationText = (id: string): fabric.Text => {
  return new fabric.Text(id, {
    fontSize: 12,
    fill: 'white',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
  });
};

/**
 * Creates a complete annotation object by combining circle and text
 */
export const createAnnotationObject = (
  annotation: { id: string; position: { x: number; y: number } },
  isSelected: boolean,
  onClick: () => void
): fabric.Group => {
  const circle = createAnnotationCircle(isSelected);
  const text = createAnnotationText(annotation.id);
  
  const group = new fabric.Group([circle, text], {
    left: annotation.position.x,
    top: annotation.position.y,
    selectable: false,
    hoverCursor: 'pointer',
  });

  // Add click handler
  group.off('mousedown');
  group.on('mousedown', onClick);
  
  return group;
};
