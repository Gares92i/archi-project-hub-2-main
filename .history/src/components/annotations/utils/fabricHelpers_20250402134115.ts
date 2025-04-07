
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
 * Disposes of a fabric canvas instance
 */
export const disposeFabricCanvas = (canvas: fabric.Canvas | null): void => {
  if (canvas) {
    try {
      canvas.off();
      canvas.dispose();
    } catch (error) {
      console.error("Erreur lors du nettoyage du canvas:", error);
    }
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
