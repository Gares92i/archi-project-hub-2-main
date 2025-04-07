import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Configurer le travailleur PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Réinitialiser l'état lorsque l'URL change
  useEffect(() => {
    setPageNumber(1);
    setScale(1);
    setRotation(0);
    setIsLoading(true);
  }, [url]);

  // Fonction appelée lors du chargement réussi du document
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Fonctions de navigation
  const goToPrevPage = () => {
    setPageNumber((prev) => (prev <= 1 ? prev : prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => (prev >= (numPages || 1) ? prev : prev + 1));
  };

  // Fonctions de zoom
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Fonction de rotation
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // En cas d'erreur de chargement du PDF
  const onDocumentLoadError = () => {
    setIsLoading(false);
    console.error("Erreur lors du chargement du PDF");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'outils */}
      <div className="bg-muted/50 p-2 flex flex-wrap items-center justify-between gap-2 border-t border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {pageNumber} / {numPages || "?"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={rotate}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Container pour le document PDF */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center">
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <Skeleton className="h-[80%] w-[80%] max-w-2xl" />
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="w-full h-full flex items-center justify-center">Chargement du PDF...</div>}
          error={<div className="w-full h-full flex items-center justify-center">Impossible de charger le PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
            renderAnnotationLayer={false} // Désactivez les annotations PDF natives
            renderTextLayer={true} // Activez la couche de texte pour permettre la sélection
          />
        </Document>
      </div>
    </div>
  );
};