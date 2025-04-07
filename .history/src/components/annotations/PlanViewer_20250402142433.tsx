import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Document, Annotation } from './types';
import { Button } from '@/components/ui/button';
import { Upload, MousePointer, ZoomIn, ZoomOut, Move, RotateCw } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ButtonGroup } from '@/components/ui/button-group';

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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Initialiser le canvas de manière sécurisée
  const initCanvas = () => {
    if (!canvasRef.current || !canvasContainerRef.current) return;
    
    // Récupérer les dimensions du conteneur
    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;
    
    // Nettoyer le canvas existant de manière sécurisée
    if (fabricCanvasRef.current) {
      try {
        const canvas = fabricCanvasRef.current;
        canvas.off();
        canvas.getObjects().forEach(obj => canvas.remove(obj));
        canvas.clear();
        canvas.dispose();
      } catch (error) {
        console.error("Erreur lors du nettoyage du canvas:", error);
      }
      fabricCanvasRef.current = null;
    }
    
    try {
      // Créer un nouveau canvas avec les dimensions du conteneur
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth || 1000,
        height: containerHeight || 800,
        backgroundColor: '#f5f5f5',
        selection: false,
        preserveObjectStacking: true
      });
      
      fabricCanvasRef.current = canvas;
      
      // Si le document a une URL, charger l'image dans le canvas
      if (document.url && document.url !== '/placeholder.svg') {
        console.log('Loading document:', document.url);
        
        // Utiliser un nouvel objet Image pour précharger l'image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!canvas || !fabricCanvasRef.current) return;
          
          const fabricImage = new fabric.Image(img, {
            selectable: false,
            evented: false
          });
          
          // Redimensionner l'image pour qu'elle tienne dans le canvas
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          // Calculer le scale pour que l'image tienne dans le canvas
          const scale = Math.min(
            canvasWidth / fabricImage.width!, 
            canvasHeight / fabricImage.height!
          ) * 0.9;
          
          fabricImage.scale(scale);
          fabricImage.set({
            left: (canvasWidth - fabricImage.width! * scale) / 2,
            top: (canvasHeight - fabricImage.height! * scale) / 2,
          });
          
          canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas));
          
          // Marquer le canvas comme prêt et ajouter les annotations
          setIsCanvasReady(true);
          addAnnotationsToCanvas();
        };
        
        img.onerror = () => {
          console.error("Erreur de chargement de l'image:", document.url);
          setIsCanvasReady(true); // Toujours marquer comme prêt pour pouvoir ajouter des annotations
          addAnnotationsToCanvas();
        };
        
        img.src = document.url;
      } else {
        setIsCanvasReady(true);
        addAnnotationsToCanvas();
      }
      
      // Configurer les événements du canvas
      canvas.on('mouse:down', handleCanvasClick);
      
      // Configurer le mode de déplacement
      canvas.on('mouse:move', function(opt) {
        if (isMoveMode && opt.e.buttons === 1) {
          const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
          canvas.relativePan(delta);
        }
      });
      
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
      
      // Créer un groupe avec un cercle et un label
      const circle = new fabric.Circle({
        left: 0,
        top: 0,
        radius: 10,
        fill: annotation.isResolved ? 'rgba(0, 200, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)',
        stroke: annotation.isResolved ? 'green' : 'red',
        strokeWidth: 2,
      });
      
      // Ajouter un texte (numéro ou indicateur)
      const label = new fabric.Text(String(annotation.id).slice(-1), {
        left: -5,
        top: -5,
        fontSize: 12,
        fill: 'white',
        fontWeight: 'bold',
        selectable: false,
        evented: false
      });
      
      // Créer un groupe avec le cercle et le label
      const group = new fabric.Group([circle, label], {
        left: annotation.position.x - 10,
        top: annotation.position.y - 10,
        selectable: false,
        data: annotation
      });
      
      // Ajouter un événement de clic sur le groupe d'annotation
      group.on('mousedown', () => {
        onAnnotationClick(annotation);
      });
      
      canvas.add(group);
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
          shadow: new fabric.Shadow({ color: 'rgba(0,0,255,0.5)', blur: 10, offsetX: 0, offsetY: 0 }),
        });
        
        // Optionnel : faire clignoter brièvement l'annotation sélectionnée
        const flashAnimation = () => {
          let opacity = 1;
          let increasing = false;
          
          const interval = setInterval(() => {
            if (opacity <= 0.5) increasing = true;
            if (opacity >= 1) increasing = false;
            
            opacity += increasing ? 0.05 : -0.05;
            obj.set({ opacity: opacity });
            canvas.renderAll();
          }, 50);
          
          // Arrêter l'animation après 1 seconde
          setTimeout(() => {
            clearInterval(interval);
            obj.set({ opacity: 1 });
            canvas.renderAll();
          }, 1000);
        };
        
        flashAnimation();
      }
    });
    
    canvas.renderAll();
  };
  
  // Gérer le clic sur le canvas pour ajouter une annotation
  const handleCanvasClick = (e: fabric.IEvent) => {
    if (!isAnnotationMode || !fabricCanvasRef.current || isMoveMode) return;
    
    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    
    onAddAnnotation({ 
      x: pointer.x, 
      y: pointer.y 
    });
    
    setIsAnnotationMode(false);
  };
  
  // Gérer le zoom
  const handleZoom = (zoomIn: boolean) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const zoomFactor = zoomIn ? 1.1 : 0.9;
    const newZoom = parseFloat((zoomLevel * zoomFactor).toFixed(2));
    
    // Limiter le niveau de zoom
    if (newZoom < 0.5 || newZoom > 5) return;
    
    // Obtenir le point central du canvas
    const center = {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2
    };
    
    canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
    setZoomLevel(newZoom);
  };
  
  // Réinitialiser le zoom et la position
  const handleResetView = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomLevel(1);
  };
  
  // Gérer le mode de déplacement
  const toggleMoveMode = () => {
    setIsMoveMode(!isMoveMode);
    setIsAnnotationMode(false);
  };
  
  // Effet pour initialiser et nettoyer le canvas
  useEffect(() => {
    // Attendre un peu pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      initCanvas();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      
      // Nettoyage sécurisé lors du démontage
      if (fabricCanvasRef.current) {
        try {
          const canvas = fabricCanvasRef.current;
          canvas.off();
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
          obj.setShadow(null);
          obj.set({ opacity: 1 });
        }
      });
      
      if (selectedAnnotation) {
        highlightSelectedAnnotation();
      }
      
      canvas.renderAll();
    }
  }, [selectedAnnotation, isCanvasReady]);
  
  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current && fabricCanvasRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = canvasContainerRef.current.clientHeight;
        
        fabricCanvasRef.current.setWidth(containerWidth);
        fabricCanvasRef.current.setHeight(containerHeight);
        fabricCanvasRef.current.renderAll();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold truncate max-w-[50%]">{document.name}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleFileInputClick}
            title="Télécharger un document"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <ButtonGroup>
            <Button
              variant={isMoveMode ? "default" : "outline"}
              onClick={toggleMoveMode}
              title="Déplacer le document"
              size="sm"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(true)}
              title="Zoomer"
              size="sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(false)}
              title="Dézoomer"
              size="sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleResetView}
              title="Réinitialiser la vue"
              size="sm"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </ButtonGroup>
          <Button 
            variant={isAnnotationMode ? "default" : "outline"} 
            onClick={() => {
              setIsAnnotationMode(!isAnnotationMode);
              setIsMoveMode(false);
            }}
            title={isAnnotationMode ? "Annuler l'ajout d'annotation" : "Ajouter une annotation"}
            size="sm"
          >
            <MousePointer className="h-4 w-4 mr-2" />
            {isAnnotationMode ? "Annuler" : "Annoter"}
          </Button>
        </div>
      </div>
      
      <div 
        className="flex-1 border rounded overflow-hidden bg-background relative"
        ref={canvasContainerRef}
      >
        <canvas ref={canvasRef} />
        
        {/* Indicateur de niveau de zoom */}
        <div className="absolute bottom-2 right-2 bg-background/80 rounded px-2 py-1 text-xs">
          Zoom: {Math.round(zoomLevel * 100)}%
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
      
      {isMoveMode && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            Mode déplacement : cliquez et faites glisser pour déplacer le plan
          </div>
        </div>
      )}
    </div>
  );
};
