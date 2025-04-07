import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Document, Annotation } from './types';
import { Button } from '@/components/ui/button';
import { Upload, MousePointer } from 'lucide-react';
import { FileUploader } from './components/FileUploader';

interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string) => void;
  onAnnotationClick: (annotation: Annotation) => void;
  projectId?: string;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({
  document,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  
  // Initialiser le canvas de manière sécurisée
  const initCanvas = () => {
    if (!canvasRef.current) return;
    
    // Nettoyer le canvas existant de manière sécurisée
    if (fabricCanvasRef.current) {
      try {
        // Supprimer tous les événements et objets avant de disposer
        const canvas = fabricCanvasRef.current;
        canvas.off(); // Détacher tous les événements
        canvas.getObjects().forEach(obj => canvas.remove(obj));
        canvas.clear();
        canvas.dispose();
      } catch (error) {
        console.error("Erreur lors du nettoyage du canvas:", error);
      }
      fabricCanvasRef.current = null;
    }
    
    try {
      // Créer un nouveau canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 1000,
        height: 800,
        backgroundColor: '#f5f5f5',
        selection: false
      });
      
      fabricCanvasRef.current = canvas;
      setIsCanvasReady(true);
      
      // Si le document a une URL, charger l'image dans le canvas
      if (document.url && document.url !== '/placeholder.svg') {
        console.log('Loading document:', document.url);
        
        fabric.Image.fromURL(document.url, (img) => {
          if (!canvas) return; // Vérifier si le canvas existe encore
          
          // Redimensionner l'image pour qu'elle tienne dans le canvas
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          // S'assurer que l'image a des dimensions
          if (!img.width || !img.height) {
            console.error("Image sans dimensions:", img);
            return;
          }
          
          // Calculer le scale pour que l'image tienne dans le canvas
          const scale = Math.min(
            canvasWidth / img.width, 
            canvasHeight / img.height
          ) * 0.9;
          
          img.scale(scale);
          img.set({
            left: (canvasWidth - img.width * scale) / 2,
            top: (canvasHeight - img.height * scale) / 2,
            selectable: false,
            evented: false,
          });
          
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
          addAnnotationsToCanvas();
        }, { crossOrigin: 'anonymous' });
      } else {
        addAnnotationsToCanvas();
      }
      
      // Ajouter l'événement de clic pour l'ajout d'annotations
      canvas.on('mouse:down', handleCanvasClick);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du canvas:", error);
      setIsCanvasReady(false);
    }
  };
  
  // Ajouter les annotations au canvas
  const addAnnotationsToCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    // Supprimer d'abord les annotations existantes
    const annotationObjects = canvas.getObjects().filter(obj => obj.data);
    annotationObjects.forEach(obj => canvas.remove(obj));
    
    // Ajouter les nouvelles annotations
    annotations.forEach(annotation => {
      // S'assurer que l'annotation a une position valide
      if (!annotation.position || typeof annotation.position.x !== 'number' || typeof annotation.position.y !== 'number') {
        console.error("Annotation avec position invalide:", annotation);
        return;
      }
      
      const circle = new fabric.Circle({
        left: annotation.position.x - 10,
        top: annotation.position.y - 10,
        radius: 10,
        fill: annotation.isResolved ? 'rgba(0, 200, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
        stroke: annotation.isResolved ? 'green' : 'red',
        strokeWidth: 2,
        selectable: false,
        data: annotation
      });
      
      // Ajouter un événement de clic sur l'annotation
      circle.on('mousedown', () => {
        onAnnotationClick(annotation);
      });
      
      canvas.add(circle);
    });
    
    // Si une annotation est sélectionnée, la mettre en évidence
    if (selectedAnnotation) {
      highlightSelectedAnnotation();
    }
    
    canvas.renderAll();
  };
  
  // Mettre en évidence l'annotation sélectionnée
  const highlightSelectedAnnotation = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedAnnotation) return;
    
    canvas.getObjects().forEach(obj => {
      if (obj.data && obj.data.id === selectedAnnotation.id) {
        obj.set({
          strokeWidth: 4,
          stroke: 'blue',
          shadow: new fabric.Shadow({ color: 'rgba(0,0,255,0.3)', blur: 10 })
        });
      }
    });
    
    canvas.renderAll();
  };
  
  // Gérer le clic sur le canvas pour ajouter une annotation
  const handleCanvasClick = (e: fabric.IEvent) => {
    if (!isAnnotationMode || !fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    
    onAddAnnotation({ 
      x: pointer.x, 
      y: pointer.y 
    });
    
    setIsAnnotationMode(false);
  };
  
  // Effet pour initialiser et nettoyer le canvas
  useEffect(() => {
    let isComponentMounted = true;
    
    // S'assurer que l'initialisation est effectuée après le montage du composant
    if (isComponentMounted) {
      initCanvas();
    }
    
    return () => {
      isComponentMounted = false;
      
      // Nettoyage sécurisé lors du démontage
      if (fabricCanvasRef.current) {
        try {
          const canvas = fabricCanvasRef.current;
          canvas.off(); // Détacher tous les événements pour éviter les fuites de mémoire
          canvas.getObjects().forEach(obj => canvas.remove(obj));
          canvas.clear();
          canvas.dispose();
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error("Erreur lors du nettoyage final du canvas:", error);
        }
      }
    };
  }, [document.id, document.url]); // Réinitialiser quand le document ou son URL change
  
  // Mettre à jour les annotations quand elles changent
  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      addAnnotationsToCanvas();
    }
  }, [annotations, isCanvasReady]);
  
  // Mettre à jour l'annotation sélectionnée
  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Réinitialiser toutes les annotations
      canvas.getObjects().forEach(obj => {
        if (obj.data) {
          const annot = obj.data;
          obj.set({
            fill: annot.isResolved ? 'rgba(0, 200, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
            stroke: annot.isResolved ? 'green' : 'red',
            strokeWidth: 2,
            shadow: null
          });
        }
      });
      
      highlightSelectedAnnotation();
    }
  }, [selectedAnnotation, isCanvasReady]);
  
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{document.name}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleFileInputClick}
            title="Télécharger un document"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <Button 
            variant={isAnnotationMode ? "default" : "outline"} 
            onClick={() => setIsAnnotationMode(!isAnnotationMode)}
            title={isAnnotationMode ? "Annuler l'ajout d'annotation" : "Ajouter une annotation"}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            {isAnnotationMode ? "Annuler" : "Annoter"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded overflow-auto bg-background">
        <div className="relative w-full h-full">
          <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
      </div>
      
      <FileUploader 
        onDocumentUpdate={onDocumentUpdate} 
        fileInputRef={fileInputRef} 
      />
      
      {isAnnotationMode && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            Cliquez sur le plan pour ajouter une annotation
          </div>
        </div>
      )}
    </div>
  );
};
