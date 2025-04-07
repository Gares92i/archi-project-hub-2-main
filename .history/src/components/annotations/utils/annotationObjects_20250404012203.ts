import { fabric } from 'fabric';

/**
 * Creates a message-square shape similar to the Lucide icon
 */
export const createMessageSquareShape = (isSelected: boolean): fabric.Object => {
  // Créer un rectangle avec un coin inférieur droit coupé pour simuler la bulle de message
  const bubbleColor = isSelected ? '#ff4d4f' : '#ff8f1f';
  
  // Rectangle principal (bulle de message)
  const rect = new fabric.Rect({
    width: 30,
    height: 30,
    rx: 5, // Coins arrondis
    ry: 5,
    fill: bubbleColor,
    stroke: '#fff',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
  });

  // Triangle pour créer l'effet de bulle de message
  const triangle = new fabric.Triangle({
    width: 12,
    height: 12,
    fill: bubbleColor,
    stroke: '#fff',
    strokeWidth: 0, // Pas de bordure pour le triangle
    originX: 'center',
    originY: 'center',
    angle: -45,
    top: 10,
    left: 10,
  });

  // Groupe contenant le rectangle et le triangle
  const bubbleGroup = new fabric.Group([rect], {
    originX: 'center',
    originY: 'center',
  });

  return bubbleGroup;
};

/**
 * Creates annotation text that fits inside the message square
 */
export const createAnnotationText = (id: string): fabric.Text => {
  // Extraire les deux derniers caractères de l'ID pour un affichage plus compact
  const shortId = id.slice(-2);
  
  return new fabric.Text(shortId, {
    fontSize: 14,
    fill: 'white',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
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
  
  // Créer un groupe avec la bulle de message et le texte
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