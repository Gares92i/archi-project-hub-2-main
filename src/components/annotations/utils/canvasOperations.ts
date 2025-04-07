
import { fabric } from 'fabric';
import { createAnnotationObject } from './annotationObjects';
import { Annotation } from '../types';

/**
 * Clears all content from the canvas
 */
export const clearCanvas = (canvas: fabric.Canvas | null): void => {
  if (!canvas) return;
  try {
    canvas.clear();
    canvas.backgroundColor = '#f0f0f0';
    canvas.renderAll();
  } catch (error) {
    console.error("Erreur lors du nettoyage du canvas:", error);
  }
};

/**
 * Adds an image to the canvas with proper scaling
 */
export const addImageToCanvas = async (
  canvas: fabric.Canvas | null,
  url: string,
  calculateScale: (imgWidth: number, imgHeight: number, canvasWidth: number, canvasHeight: number) => number,
  centerImage: (img: fabric.Image, scale: number, canvasWidth: number, canvasHeight: number) => void,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> => {
  if (!canvas) return;
  
  try {
    return new Promise<void>((resolve, reject) => {
      fabric.Image.fromURL(url, 
        (img) => {
          if (!img || !img.width || !img.height) {
            reject(new Error("Impossible de charger l'image"));
            return;
          }
          
          // Calculate appropriate scale
          const scale = calculateScale(img.width, img.height, canvasWidth, canvasHeight);
          
          // Center image in canvas
          centerImage(img, scale, canvasWidth, canvasHeight);
          
          clearCanvas(canvas);
          canvas.add(img);
          canvas.renderAll();
          resolve();
        },
        { crossOrigin: 'Anonymous' }
      );
    });
  } catch (error) {
    console.error("Erreur lors du chargement de l'image:", error);
  }
};

/**
 * Sets the zoom level of the canvas
 */
export const setCanvasZoom = (canvas: fabric.Canvas | null, zoom: number): void => {
  if (!canvas) return;
  
  try {
    canvas.setZoom(zoom);
    canvas.renderAll();
  } catch (error) {
    console.error("Erreur lors de la modification du zoom:", error);
  }
};

/**
 * Adds an annotation to the canvas
 */
export const addAnnotationToCanvas = (
  canvas: fabric.Canvas | null,
  annotation: Annotation,
  isSelected: boolean,
  onClick: () => void
): fabric.Object | null => {
  if (!canvas) return null;
  
  try {
    const group = createAnnotationObject(annotation, isSelected, onClick);
    canvas.add(group);
    return group;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une annotation:", error);
    return null;
  }
};

/**
 * Removes all annotations from the canvas
 */
export const removeAllAnnotationsFromCanvas = (canvas: fabric.Canvas | null): void => {
  if (!canvas) return;
  
  try {
    const objects = [...canvas.getObjects()];
    // Remove all objects except the first one (background image)
    if (objects.length > 1) {
      for (let i = 1; i < objects.length; i++) {
        canvas.remove(objects[i]);
      }
    }
    canvas.renderAll();
  } catch (error) {
    console.error("Erreur lors de la suppression des annotations:", error);
  }
};
