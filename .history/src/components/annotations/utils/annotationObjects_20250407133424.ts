import { fabric } from 'fabric';

/**
 * Creates a message-square shape using SVG path
 */
export const createMessageSquareShape = (isSelected: boolean): fabric.Path => {
  // Path SVG représentant une icône message-square semblable à celle de Lucide
  const messagePath = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z';
  
  // Couleur de l'icône
  const bubbleColor = isSelected ? '#ff4d4f' : '#ff8f1f';

  // Créer un path fabric à partir du SVG
  const path = new fabric.Path(messagePath, {
    fill: bubbleColor,
    stroke: '#fff',
    strokeWidth: 1.5,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    scaleX: 1.2,
    scaleY: 1.2,
    originX: 'center',
    originY: 'center'
  });
  
  return path;
};

/**
 * Creates annotation text that fits inside the message square
 */
export const createAnnotationText = (id: string): fabric.Text => {
  // Extraire le dernier caractère de l'ID pour un affichage compact
  const shortId = id.slice(-1);
  
  return new fabric.Text(shortId, {
    fontSize: 10,
    fill: 'white',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
    top: -2, // Ajuster la position verticale pour centrer dans l'icône
  });
};

/**
 * Creates a complete annotation object by combining message square and text
 */
export const createAnnotationObject = (
  annotation: { id: string; position: { x: number; y: number } },
  isSelected: boolean,
  onClick: () => void
) => {
  const radius = isSelected ? 18 : 15;
  const color = isSelected ? "#0091ff" : "#f97316"; // Primary color for selected, orange for normal
  
  // Create the circle object
  const circle = new fabric.Circle({
    left: annotation.position.x,
    top: annotation.position.y,
    radius: radius,
    fill: isSelected ? color : `${color}20`, // Lighter fill for normal state
    stroke: color,
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
    hasControls: false,
    hasBorders: false,
    selectable: true,
    hoverCursor: 'pointer',
    name: annotation.id,
    objectCaching: false,
  });
  
  // Add click handler
  circle.on('mousedown', () => {
    onClick();
  });
  
  // Add a number label to the circle
  const text = new fabric.Text(annotation.id.substring(annotation.id.length - 2), {
    fontSize: 10,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fill: isSelected ? 'white' : color,
    originX: 'center',
    originY: 'center',
    left: annotation.position.x,
    top: annotation.position.y,
    selectable: false,
    evented: false,
  });
  
  // Group the circle and text together
  const group = new fabric.Group([circle, text], {
    left: annotation.position.x,
    top: annotation.position.y,
    hasControls: false,
    hasBorders: false,
    selectable: true,
    hoverCursor: 'pointer',
    originX: 'center',
    originY: 'center',
    name: annotation.id,
    data: { id: annotation.id },
    objectCaching: false,
  });
  
  group.on('mousedown', () => {
    onClick();
  });
  
  return group;
};