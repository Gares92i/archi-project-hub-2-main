import React, { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Document, Annotation } from "./types";
import { Button } from "@/components/ui/button";
import {
  Upload,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
} from "lucide-react";
import { FileUploader } from "./annotat/FileUploader";
import { ButtonGroup } from "@/components/ui/button-group";
import { createAnnotationObject } from "./utils/annotationObjects";

interface PlanViewerProps {
  document: Document;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void;
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
        canvas.getObjects().forEach((obj) => canvas.remove(obj));
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
        backgroundColor: "#f5f5f5",
        selection: false,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      // Si le document a une URL, charger l'image dans le canvas
      if (document.url && document.url !== "/placeholder.svg") {
        console.log("Loading document:", document.url);

        // Utiliser un nouvel objet Image pour précharger l'image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!canvas || !fabricCanvasRef.current) return;

          const fabricImage = new fabric.Image(img, {
            selectable: false,
            evented: false,
          });

          // Redimensionner l'image pour qu'elle tienne dans le canvas
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();

          // S'assurer que l'image a des dimensions
          if (!fabricImage.width || !fabricImage.height) {
            console.error("Image sans dimensions:", fabricImage);
            setIsCanvasReady(true);
            addAnnotationsToCanvas();
            return;
          }

          // Calculer le scale pour que l'image tienne dans le canvas
          const scale =
            Math.min(
              canvasWidth / fabricImage.width,
              canvasHeight / fabricImage.height
            ) * 0.9;

          fabricImage.scale(scale);
          fabricImage.set({
            left: (canvasWidth - fabricImage.width * scale) / 2,
            top: (canvasHeight - fabricImage.height * scale) / 2,
          });

          // Définir l'image comme background du canvas
          canvas.setBackgroundImage(fabricImage, () => {
            canvas.renderAll();
            // Marquer le canvas comme prêt et ajouter les annotations
            setIsCanvasReady(true);
            addAnnotationsToCanvas();
          });
        };

        img.onerror = (error) => {
          console.error(
            "Erreur de chargement de l'image:",
            document.url,
            error
          );
          setIsCanvasReady(true); // Toujours marquer comme prêt pour pouvoir ajouter des annotations
          addAnnotationsToCanvas();
        };

        img.src = document.url;
      } else {
        setIsCanvasReady(true);
        addAnnotationsToCanvas();
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du canvas:", error);
      setIsCanvasReady(false);
    }
  };

  // Ajouter les annotations au canvas
  const addAnnotationsToCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Supprimer d'abord les annotations existantes
    const annotationObjects = canvas.getObjects().filter((obj) => obj.data);
    annotationObjects.forEach((obj) => canvas.remove(obj));

    // Ajouter les nouvelles annotations
    annotations.forEach((annotation) => {
      // S'assurer que l'annotation a une position valide
      if (!annotation || (typeof annotation.x !== "number" && typeof annotation.y !== "number")) {
        console.error("Annotation avec position invalide:", annotation);
        return;
      }

      // Position finale - utilise soit x/y directs, soit position.x/y
      const posX = annotation.x || annotation.position?.x || 0;
      const posY = annotation.y || annotation.position?.y || 0;

      // Utiliser la fonction createAnnotationObject au lieu de créer un cercle directement
      const annotationObj = createAnnotationObject(
        {
          id: annotation.id,
          position: { x: posX, y: posY }
        },
        selectedAnnotation?.id === annotation.id,
        () => onAnnotationClick(annotation)
      );

      // Associer les données de l'annotation à l'objet canvas
      annotationObj.data = annotation;

      canvas.add(annotationObj);
    });

    canvas.renderAll();
  }, [annotations, selectedAnnotation, onAnnotationClick]);

  // Mettre en évidence l'annotation sélectionnée
  const highlightSelectedAnnotation = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedAnnotation) return;

    canvas.getObjects().forEach((obj) => {
      if (obj.data && obj.data.id === selectedAnnotation.id) {
        obj.set({
          shadow: new fabric.Shadow({
            color: "rgba(0,0,255,0.5)",
            blur: 10,
            offsetX: 0,
            offsetY: 0,
          }),
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
  }, [selectedAnnotation]);

  // Gérer le clic sur le canvas pour ajouter une annotation
  const handleCanvasClick = useCallback(
    (e: fabric.IEvent) => {
      if (!isAnnotationMode || !fabricCanvasRef.current || isMoveMode) return;

      const canvas = fabricCanvasRef.current;
      const pointer = canvas.getPointer(e.e);

      console.log("Ajout d'annotation à:", pointer);
      onAddAnnotation({
        x: pointer.x,
        y: pointer.y,
      });

      setIsAnnotationMode(false);
    },
    [isAnnotationMode, isMoveMode, onAddAnnotation]
  );

  // Gérer le zoom
  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const zoomFactor = zoomIn ? 1.1 : 0.9;
      const newZoom = parseFloat((zoomLevel * zoomFactor).toFixed(2));

      // Limiter le niveau de zoom
      if (newZoom < 0.5 || newZoom > 5) return;

      // Obtenir le point central du canvas
      const center = {
        x: canvas.getWidth() / 2,
        y: canvas.getHeight() / 2,
      };

      canvas.zoomToPoint(new fabric.Point(center.x, center.y), newZoom);
      setZoomLevel(newZoom);
    },
    [zoomLevel]
  );

  // Réinitialiser le zoom et la position
  const handleResetView = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomLevel(1);
  }, []);

  // Gérer le mode de déplacement
  const toggleMoveMode = useCallback(() => {
    setIsMoveMode(!isMoveMode);
    setIsAnnotationMode(false);
  }, [isMoveMode]);

  // Toggle du mode annotation
  const toggleAnnotationMode = useCallback(() => {
    setIsAnnotationMode(!isAnnotationMode);
    setIsMoveMode(false);
  }, [isAnnotationMode]);

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
          canvas.getObjects().forEach((obj) => canvas.remove(obj));
          canvas.clear();
          canvas.dispose();
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error("Erreur lors du nettoyage final du canvas:", error);
        }
      }
    };
  }, [document.id, document.url]);

  // Mettre à jour les annotations quand elles changent
  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      addAnnotationsToCanvas();
    }
  }, [annotations, isCanvasReady, addAnnotationsToCanvas]);

  // Mettre à jour l'annotation sélectionnée
  useEffect(() => {
    if (isCanvasReady && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;

      // Réinitialiser toutes les annotations
      canvas.getObjects().forEach((obj) => {
        if (obj.data) {
          obj.set({
            shadow: null,
            opacity: 1,
          });
        }
      });

      if (selectedAnnotation) {
        highlightSelectedAnnotation();
      }

      canvas.renderAll();
    }
  }, [selectedAnnotation, isCanvasReady, highlightSelectedAnnotation]);

  // Effet pour mettre à jour les gestionnaires d'événements quand les modes changent
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Nettoyer d'abord tous les anciens événements
    canvas.off("mouse:down");
    canvas.off("mouse:move");

    // Ajouter l'événement de clic pour l'ajout d'annotation
    canvas.on("mouse:down", handleCanvasClick);

    // Configurer le mode de déplacement
    canvas.on("mouse:move", function (opt) {
      if (isMoveMode && opt.e.buttons === 1) {
        const delta = new fabric.Point(opt.e.movementX, opt.e.movementY);
        canvas.relativePan(delta);
        canvas.requestRenderAll();
      }
    });

    // Mettre à jour le curseur en fonction du mode actif
    if (isAnnotationMode) {
      canvas.defaultCursor = "crosshair";
    } else if (isMoveMode) {
      canvas.defaultCursor = "grab";
    } else {
      canvas.defaultCursor = "default";
    }
  }, [isAnnotationMode, isMoveMode, handleCanvasClick]);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold truncate max-w-[50%]">
          {document.name}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleFileInputClick}
            title="Télécharger un document"
            size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <ButtonGroup>
            <Button
              variant={isMoveMode ? "default" : "outline"}
              onClick={toggleMoveMode}
              title="Déplacer le document"
              size="sm">
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(true)}
              title="Zoomer"
              size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleZoom(false)}
              title="Dézoomer"
              size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleResetView}
              title="Réinitialiser la vue"
              size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button 
              variant={isMoveMode ? "default" : "outline"}
              size="sm"
              onClick={toggleMoveMode}
              className="flex items-center"
            >
              <Move className="h-4 w-4 mr-2" />
              Déplacer
            </Button>
            <Button
              variant={isAnnotationMode ? "default" : "outline"}
              size="sm"
              onClick={toggleAnnotationMode}
              className="flex items-center"
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Annoter
            </Button>
          </ButtonGroup>
          <Button
            variant={isAnnotationMode ? "default" : "outline"}
            onClick={toggleAnnotationMode}
            title={
              isAnnotationMode
                ? "Annuler l'ajout d'annotation"
                : "Ajouter une annotation"
            }
            size="sm">
            <MousePointer className="h-4 w-4 mr-2" />
            {isAnnotationMode ? "Annuler" : "Annoter"}
          </Button>
        </div>
      </div>

      <div
        className="flex-1 border rounded overflow-hidden bg-background relative"
        ref={canvasContainerRef}>
        <canvas ref={canvasRef} />

        {/* Indicateur de niveau de zoom */}
        <div className="absolute bottom-2 right-2 bg-background/80 rounded px-2 py-1 text-xs">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      <FileUploader
        onDocumentUpdate={(url, filename) => onDocumentUpdate(url, filename)}
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
