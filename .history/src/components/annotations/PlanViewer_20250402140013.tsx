import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Document, Annotation } from '../t';
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
  
  // Fonction pour initialiser le canvas avec l'image/PDF du document
  const initCanvas = () => {
    if (!canvasRef.current) return;
    
    // Nettoyer le canvas existant
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }
    
    // Créer un nouveau canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1000,
      height: 800,
      backgroundColor: '#f5f5f5',
      selection: false
    });
    fabricCanvasRef.current = canvas;
    
    // Si le document a une URL, charger l'image dans le canvas
    if (document.url && document.url !== '/placeholder.svg') {
      console.log('Loading document:', document.url);
      
      fabric.Image.fromURL(document.url, (img) => {
        // Redimensionner l'image pour qu'elle tienne dans le canvas tout en gardant les proportions
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Calculer le scale pour que l'image tienne dans le canvas
        const scale = Math.min(
          canvasWidth / img.width!, 
          canvasHeight / img.height!
        ) * 0.9; // 90% de la taille maximale pour laisser une marge
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - img.width! * scale) / 2,
          top: (canvasHeight - img.height! * scale) / 2,
          selectable: false,
          evented: false,
        });
        
        // Définir l'image comme background
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        addAnnotationsToCanvas(canvas);
      }, {
        crossOrigin: 'anonymous'
      });
    } else {
      // Si pas d'URL, afficher juste les annotations sur un canvas vide
      addAnnotationsToCanvas(canvas);
    }
    
    // Ajouter l'événement de clic pour l'ajout d'annotations
    canvas.on('mouse:down', handleCanvasClick);
  };
  
  // Ajouter les annotations au canvas
  const addAnnotationsToCanvas = (canvas: fabric.Canvas) => {
    annotations.forEach(annotation => {
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
      
      circle.on('mousedown', () => {
        onAnnotationClick(annotation);
      });
      
      canvas.add(circle);
    });
    
    // Si une annotation est sélectionnée, la mettre en évidence
    if (selectedAnnotation) {
      highlightSelectedAnnotation(canvas, selectedAnnotation);
    }
    
    canvas.renderAll();
  };
  
  // Mettre en évidence l'annotation sélectionnée
  const highlightSelectedAnnotation = (canvas: fabric.Canvas, annotation: Annotation) => {
    canvas.getObjects().forEach(obj => {
      if (obj.data && obj.data.id === annotation.id) {
        obj.set({
          strokeWidth: 4,
          stroke: 'blue',
          shadow: new fabric.Shadow({ color: 'rgba(0,0,255,0.3)', blur: 10 })
        });
      }
    });
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
  
  // Initialiser le canvas quand le document change
  useEffect(() => {
    initCanvas();
    
    return () => {
      // Cleanup
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [document.url]); // Dépendance au document.url pour recharger quand l'URL change
  
  // Mettre à jour les annotations quand elles changent
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Supprimer toutes les annotations existantes
      const annotationObjects = canvas.getObjects().filter(obj => obj.data);
      annotationObjects.forEach(obj => canvas.remove(obj));
      
      // Ajouter les nouvelles annotations
      addAnnotationsToCanvas(canvas);
    }
  }, [annotations]);
  
  // Mettre à jour l'annotation sélectionnée
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Réinitialiser toutes les annotations
      canvas.getObjects().forEach(obj => {
        if (obj.data) {
          const annot = obj.data as Annotation;
          obj.set({
            fill: annot.isResolved ? 'rgba(0, 200, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
            stroke: annot.isResolved ? 'green' : 'red',
            strokeWidth: 2,
            shadow: null
          });
        }
      });
      
      // Mettre en évidence l'annotation sélectionnée
      if (selectedAnnotation) {
        highlightSelectedAnnotation(canvas, selectedAnnotation);
      }
      
      canvas.renderAll();
    }
  }, [selectedAnnotation]);
  
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
