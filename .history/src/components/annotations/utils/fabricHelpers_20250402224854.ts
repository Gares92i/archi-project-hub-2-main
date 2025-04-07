import { fabric } from 'fabric';

/**
 * Interface étendue pour accéder aux propriétés internes du canvas
 */
interface ExtendedCanvas extends fabric.Canvas {
  wrapperEl?: HTMLElement;
  lowerCanvasEl?: HTMLCanvasElement;
  upperCanvasEl?: HTMLCanvasElement;
  contextContainer?: CanvasRenderingContext2D;
  contextTop?: CanvasRenderingContext2D;
}

/**
 * Fonction sécurisée pour disposer d'un canvas Fabric.js
 * Cette fonction gère toutes les exceptions possibles et nettoie
 * correctement les ressources pour éviter les fuites mémoire
 */
export const safeDisposeFabricCanvas = (canvas: fabric.Canvas | null | undefined): void => {
  if (!canvas) return;
  
  try {
    // Capturer les références avant de commencer la disposition
    const extCanvas = canvas as ExtendedCanvas;
    const wrapper: HTMLElement | undefined = extCanvas.wrapperEl;
    const parentNode = wrapper?.parentNode;
    
    // 1. Supprimer tous les objets et handlers d'événements
    try {
      // Supprimer les objets
      canvas.getObjects().forEach(obj => {
        try {
          canvas.remove(obj);
        } catch (e) {
          console.warn('Erreur lors de la suppression d\'un objet:', e);
        }
      });

      // Supprimer les handlers d'événements
      try {
        canvas.off();
      } catch (e) {
        console.warn('Erreur lors de la suppression des handlers:', e);
      }
    } catch (e) {
      console.warn('Erreur lors du nettoyage des objets/événements:', e);
    }
    
    // 2. Essayer d'appeler la méthode dispose standard
    try {
      canvas.dispose();
      console.log('Canvas dispose() réussi');
      return;  // Si nous sommes arrivés ici, tout est bien
    } catch (e) {
      console.warn('Erreur standard lors de dispose():', e);
      // Continue avec le nettoyage manuel
    }
    
    // 3. Nettoyage manuel si dispose() a échoué
    if (wrapper && parentNode) {
      try {
        // Vérifier si l'élément est toujours attaché au DOM
        if (wrapper.parentNode === parentNode) {
          parentNode.removeChild(wrapper);
          console.log('Nettoyage manuel du wrapper réussi');
        }
      } catch (e) {
        console.warn('Erreur lors du nettoyage manuel du wrapper:', e);
      }
    }

    // 4. Essayer de nettoyer les canvasEl si nécessaire
    try {
      if (extCanvas.lowerCanvasEl && extCanvas.lowerCanvasEl.parentNode) {
        extCanvas.lowerCanvasEl.parentNode.removeChild(extCanvas.lowerCanvasEl);
      }
      if (extCanvas.upperCanvasEl && extCanvas.upperCanvasEl.parentNode) {
        extCanvas.upperCanvasEl.parentNode.removeChild(extCanvas.upperCanvasEl);
      }
    } catch (e) {
      console.warn('Erreur lors du nettoyage des canvasEl:', e);
    }
    
    // 5. Essayer de libérer les contextes
    try {
      if (extCanvas.contextContainer) {
        (extCanvas.contextContainer as any) = null;
      }
      if (extCanvas.contextTop) {
        (extCanvas.contextTop as any) = null;
      }
    } catch (e) {
      console.warn('Erreur lors de la libération des contextes:', e);
    }

  } catch (error) {
    console.error('Erreur générale lors de la disposition du canvas:', error);
  }
};

/**
 * Fonction utilitaire pour correctement initialiser un canvas Fabric.js
 * et éviter les problèmes de disposition
 */
export const createSafeFabricCanvas = (
  canvasElement: HTMLCanvasElement,
  options: fabric.ICanvasOptions = {}
): fabric.Canvas => {
  // S'assurer que le canvas est vide/propre avant l'initialisation
  const existingWrapper = canvasElement.parentElement?.querySelector('.canvas-container');
  
  if (existingWrapper) {
    try {
      existingWrapper.parentNode?.removeChild(existingWrapper);
    } catch (e) {
      console.warn('Impossible de supprimer un wrapper existant:', e);
    }
  }
  
  // Créer un nouveau canvas avec les options fusionnées
  const defaultOptions = {
    selection: false,
    preserveObjectStacking: true,
    width: canvasElement.width,
    height: canvasElement.height
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return new fabric.Canvas(canvasElement, mergedOptions);
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
    canvasWidth / imgWidth,
    canvasHeight / imgHeight,
    1 // Ne pas agrandir les petites images
  ) * 0.9; // Marge autour de l'image
};

/**
 * Centers an image in the canvas
 */
export const centerImageInCanvas = (
  image: fabric.Image,
  scale: number,
  canvasWidth: number,
  canvasHeight: number
): void => {
  image.scale(scale);
  image.set({
    left: (canvasWidth - image.width! * scale) / 2,
    top: (canvasHeight - image.height! * scale) / 2,
    selectable: false,
    evented: false
  });
};
