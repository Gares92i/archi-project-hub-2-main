import React, { useEffect, useCallback, useRef, useState } from "react";
import { PlanViewer } from "./PlanViewer";
import { Document, Annotation } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface MainContentProps {
  activeDocument: Document | null;
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAddAnnotation: (position: { x: number; y: number }) => void;
  onDocumentUpdate: (url: string, filename?: string) => void; // Ajoutez filename
  onAnnotationClick: (annotation: Annotation) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeDocument,
  annotations,
  selectedAnnotation,
  onAddAnnotation,
  onDocumentUpdate,
  onAnnotationClick,
}) => {
  const isMobile = useIsMobile();
  const { id: projectId } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

  // Debugging pour l'upload de fichiers
  useEffect(() => {
    if (fileInputRef.current) {
      const originalAddEventListener = fileInputRef.current.addEventListener;
      fileInputRef.current.addEventListener = function(type, listener, options) {
        if (type === 'change') {
          console.log('Écouteur change ajouté au input file');
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    }
  }, [fileInputRef]);

  // Lors de l'appel à onDocumentUpdate
  const handleFileSelected = useCallback((url: string, filename?: string) => {
    console.log("MainContent: handleFileSelected appelé avec", {
      filename: filename || "sans nom",
      urlLength: url.length,
      type: url.substring(0, 30) + "..."
    });

    if (onDocumentUpdate) {
      onDocumentUpdate(url, filename);
    }
  }, [onDocumentUpdate]);

  // Modifiez le rendu du document pour garantir que le fond est visible
  useEffect(() => {
    if (activeDocument && containerRef.current) {
      // Nettoyage du contenu précédent
      setIsDocumentLoading(true);
      
      if (activeDocument.type === "pdf") {
        renderPdfDocument(activeDocument.url);
      } else if (activeDocument.type === "img") {
        renderImageDocument(activeDocument.url);
      }
    }
  }, [activeDocument]);

  // Ajouter cette fonction de rendu d'image
  const renderImageDocument = (url) => {
    if (!containerRef.current) return;
    
    // Nettoyer le contenu précédent
    const existingImg = containerRef.current.querySelector('img:not(.annotation-image)');
    if (existingImg) {
      existingImg.remove();
    }

    // Créer une nouvelle image
    const img = new Image();
    img.onload = () => {
      if (containerRef.current) {
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.zIndex = '1'; // Sous les annotations
        
        // Ajoutez l'image au conteneur
        containerRef.current.appendChild(img);
        setIsDocumentLoading(false);
      }
    };
    
    img.onerror = () => {
      console.error("Erreur lors du chargement de l'image:", url);
      setIsDocumentLoading(false);
      toast.error("Impossible de charger l'image");
    };
    
    img.src = url;
  };

  // Ajouter cette fonction pour les PDFs
  const renderPdfDocument = async (url) => {
    try {
      // Si vous utilisez PDF.js, chargez le PDF ici
      // Exemple simplifié:
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.top = '0';
      pdfContainer.style.left = '0';
      pdfContainer.style.width = '100%';
      pdfContainer.style.height = '100%';
      pdfContainer.style.zIndex = '1';
      
      // Si PDF.js n'est pas disponible, on peut afficher une iframe
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      pdfContainer.appendChild(iframe);
      
      if (containerRef.current) {
        // Nettoyer le contenu précédent
        const existingPdf = containerRef.current.querySelector('div[data-pdf-container]');
        if (existingPdf) {
          existingPdf.remove();
        }
        
        pdfContainer.setAttribute('data-pdf-container', 'true');
        containerRef.current.appendChild(pdfContainer);
      }
      
      setIsDocumentLoading(false);
    } catch (error) {
      console.error("Erreur lors du rendu du PDF:", error);
      setIsDocumentLoading(false);
      toast.error("Impossible de charger le PDF");
    }
  };

  // Ajoutez ce useEffect pour tracer les changements de activeDocument
  useEffect(() => {
    console.log("MainContent: activeDocument changed", 
      activeDocument ? { 
        id: activeDocument.id, 
        name: activeDocument.name, 
        type: activeDocument.type,
        urlStart: activeDocument.url?.substring(0, 30) + "..." 
      } : null
    );
    
    // Si le document est null, nettoyer la vue
    if (!activeDocument && containerRef.current) {
      // Supprimer toutes les images de document
      const existingImgs = containerRef.current.querySelectorAll('img:not(.annotation-image)');
      existingImgs.forEach(img => img.remove());
      
      // Supprimer les conteneurs PDF
      const existingPdfs = containerRef.current.querySelectorAll('div[data-pdf-container]');
      existingPdfs.forEach(pdf => pdf.remove());
    }
  }, [activeDocument]);

  if (!activeDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Aucun document sélectionné</p>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full", isMobile ? "p-2" : "p-4")} ref={containerRef}>
      <PlanViewer
        key={activeDocument.id}
        document={activeDocument || { id: "0", name: "Aucun document", url: "", type: "pdf", annotations: [] }}
        annotations={annotations}
        onAddAnnotation={onAddAnnotation}
        onDocumentUpdate={handleFileSelected}
        onAnnotationClick={onAnnotationClick}
        selectedAnnotation={selectedAnnotation}
        projectId={projectId || "1"}
      />
    </div>
  );
};
