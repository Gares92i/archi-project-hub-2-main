// Réactiver la boîte de dialogue de nommage

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDocumentUpdate,
  fileInputRef,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Vérifier le type de fichier
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Seuls les fichiers PDF et images sont acceptés");
      return;
    }
    
    // Nettoyer le nom de fichier
    const cleanFilename = file.name.replace(/[^\w\s.-]/g, '_');
    const loadingToast = toast.loading(`Lecture de ${cleanFilename} en cours...`);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          
          // Stocker pour la boîte de dialogue
          setSelectedFile(file);
          setFileDataUrl(dataUrl);
          
          // Ouvrir la boîte de dialogue pour nommer le document
          setIsNamingDialogOpen(true);
          
          toast.dismiss(loadingToast);
        } else {
          toast.dismiss(loadingToast);
          toast.error(`Échec du traitement de ${cleanFilename}`);
        }
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error(`Échec du téléchargement de ${cleanFilename}`);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Échec du téléchargement de ${cleanFilename}`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Ajouter également le reste des handlers et le DialogDocumentName
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,image/*"
        className="hidden"
      />
      
      <DialogDocumentName
        isOpen={isNamingDialogOpen}
        onClose={() => {
          setIsNamingDialogOpen(false);
          setSelectedFile(null);
          setFileDataUrl(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        onSave={(documentName) => {
          if (fileDataUrl) {
            onDocumentUpdate(fileDataUrl, documentName);
            setSelectedFile(null);
            setFileDataUrl(null);
            setIsNamingDialogOpen(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            toast.success(`Document "${documentName}" ajouté avec succès`);
          }
        }}
        defaultName={selectedFile?.name.replace(/\.[^/.]+$/, "") || ""}
      />
    </>
  );
};