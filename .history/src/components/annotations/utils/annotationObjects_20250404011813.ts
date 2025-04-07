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
    scaleX: 1.2, // Ajuster l'échelle si nécessaire
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
    top: -2, // Ajuster la position verticale du texte pour le centrer
  });
};

/**
 * Creates a complete annotation object by combining message square and text
 */
export const createAnnotationObject = (
  annotation: { id: string; position: { x: number; y: number } },
  isSelected: boolean,
  onClick: () => void
): fabric.Group => {
  const messageSquare = createMessageSquareShape(isSelected);
  const text = createAnnotationText(annotation.id);
  
  // Créer un groupe avec l'icône message-square et le texte
  const group = new fabric.Group([messageSquare, text], {
    left: annotation.position.x,
    top: annotation.position.y,
    selectable: false,
    hoverCursor: 'pointer',
  });
  
  // Ajouter le gestionnaire d'événement de clic
  group.off('mousedown');
  group.on('mousedown', onClick);
  
  return group;
};