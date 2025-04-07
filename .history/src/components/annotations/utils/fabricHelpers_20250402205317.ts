import { fabric } from 'fabric';

/**
 * Creates a fabric canvas instance
 */
export const createFabricCanvas = (
  canvasElement: HTMLCanvasElement,
  width: number, 
  height: number
): fabric.Canvas => {
  return new fabric.Canvas(canvasElement, {
    selection: false,
    backgroundColor: '#f0f0f0',
    width,
    height,
    preserveObjectStacking: true
  });
};

/**
 * Fonction sécurisée pour disposer du canvas
 */
export const disposeFabricCanvas = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;
  
  try {
    // Supprimer tous les objets du canvas pour éviter des fuites mémoire
    canvas.getObjects().forEach(obj => {
      canvas.remove(obj);
    });
    
    // Tenter de disposer le canvas avec gestion d'erreur
    try {
      canvas.dispose();
    } catch (error) {
      console.error("Erreur lors de la disposition du canvas:", error);
      
      // Nettoyage manuel si dispose échoue - éviter l'utilisation de any
      try {
        // Définir une interface pour accéder aux propriétés non typées de fabric.Canvas
        interface ExtendedCanvas extends fabric.Canvas {
          wrapperEl?: HTMLElement;
        }
        
        const extendedCanvas = canvas as ExtendedCanvas;
        if (extendedCanvas.wrapperEl) {
          const parent = extendedCanvas.wrapperEl.parentNode;
          if (parent) {
            parent.removeChild(extendedCanvas.wrapperEl);
          }
        }
      } catch (e) {
        console.error("Erreur lors du nettoyage manuel du canvas:", e);
      }
    }
  } catch (error) {
    console.error("Erreur globale lors de la disposition du canvas:", error);
  }
};

/**
 * Calculates appropriate image scale to fit within canvas dimensions
 */
export const calculateImageScale = (
  imgWidth: number, 
  imgHeight: number, 
  canvasWidth: number, 
  canvasHeight: number
): number => {
  return Math.min(
    (canvasWidth * 0.8) / imgWidth,
    (canvasHeight * 0.8) / imgHeight
  );
};

/**
 * Centers an image in the canvas
 */
export const centerImageInCanvas = (
  img: fabric.Image, 
  scale: number, 
  canvasWidth: number, 
  canvasHeight: number
): void => {
  img.set({
    selectable: false,
    evented: false,
    scaleX: scale,
    scaleY: scale,
    left: (canvasWidth - img.width! * scale) / 2,
    top: (canvasHeight - img.height! * scale) / 2
  });
};
