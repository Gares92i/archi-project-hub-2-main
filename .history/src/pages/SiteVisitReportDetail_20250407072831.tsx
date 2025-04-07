
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, 
  Calendar,
  User,
  Building, 
  FileText, 
  Printer,
  Mail, 
  Edit,
  Download,
  FileUp,
  Eye,
  FilePlus
} from "lucide-react";
import { 
  Table,
  TableHeader, 
  TableRow, 
  TableHead,
  TableBody,
  TableCell 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  getReportById,
  addAttachment 
} from "@/components/services/reportService";
import { getProjectById } from "@/components/services/projectService";
import { SiteVisitReport } from "@/components/services/types";
import { ProjectCardProps } from "@/components/ProjectCard";
import ReportHeader from "@/components/project/ReportHeader";
import ReportFooter from "@/components/project/ReportFooter";
import { SiteVisitReportUploader } from "@/components/project/SiteVisitReportUploader";
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { reportTemplates } from "@/components/project/ReportTemplateSelector";

const SiteVisitReportDetail = () => {
  const { projectId, reportId } = useParams<{ projectId: string; reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<SiteVisitReport | null>(null);
  const [project, setProject] = useState<ProjectCardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingAttachment, setAddingAttachment] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const printSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportId || !projectId) return;

      try {
        setLoading(true);
        // Fetch report data
        const reportData = await getReportById(reportId);
        
        if (!reportData) {
          toast.error("Rapport introuvable");
          navigate(`/projects/${projectId}`);
          return;
        }

        setReport(reportData);

        // Fetch project data
        const projectData = await getProjectById(projectId);
        if (projectData) {
          setProject(projectData);
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [reportId, projectId, navigate]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">En attente</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">En cours</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Terminé</Badge>;
      case "on-hold":
        return <Badge className="bg-gray-500">En pause</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddAttachment = async (fileUrl: string) => {
    if (!reportId) return;
    setAddingAttachment(true);
    
    try {
      toast.success("Document joint avec succès");
      // In a real app, we would save this to the database
      if (report) {
        const attachments = report.attachments || [];
        setReport({
          ...report,
          attachments: [...attachments, fileUrl]
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      toast.error("Erreur lors de l'ajout du document");
    } finally {
      setAddingAttachment(false);
    }
  };

  // Générer un PDF fictif à partir du contenu du rapport
  const generatePdfPreview = () => {
    setPdfPreviewOpen(true);

    // En production, vous pourriez utiliser jsPDF, pdfmake ou une API backend
    // pour générer un véritable PDF, mais ici nous simulons juste l'aperçu
    setTimeout(() => {
      // Cette fonction serait remplacée par la génération réelle du PDF
      console.log("Génération du PDF en cours...");
    }, 500);
  };

  // Déterminer si une section doit être affichée en fonction du modèle
  const shouldShowSection = (sectionName: string): boolean => {
    if (!report || !report.templateId) return true; // Par défaut, tout montrer si pas de modèle
    
    const template = reportTemplates.find(t => t.id === report.templateId);
    return template?.fields.includes(sectionName) || false;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  if (!report || !project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p>Rapport ou projet introuvable</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compte Rendu de Visite</h1>
            <p className="text-muted-foreground">
              Projet: {project.name} - Visite du {formatDate(report.visitDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={generatePdfPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualiser PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success("Rapport envoyé par email")}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileUp className="h-4 w-4 mr-2" />
                Joindre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Joindre un document</DialogTitle>
                <DialogDescription>
                  Sélectionnez un document à joindre à ce rapport.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <SiteVisitReportUploader 
                  onFileUploaded={handleAddAttachment} 
                  accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  type="document"
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate(`/projects/${projectId}/report/${reportId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="print:mt-10" ref={printSectionRef}>
        <ReportHeader 
          projectId={projectId || ""} 
          reportNumber={report.reportNumber} 
          visitDate={report.visitDate}
        />

        <Card className="mb-6 print:shadow-none print:border-none">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Résumé de la visite</CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="mr-2">Responsable: {report.inCharge}</span>
                    <Building className="h-4 w-4 mr-1 ml-2 text-muted-foreground" />
                    <span>Entreprise: {report.contractor}</span>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Progression du projet</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Progression:</span>
                    <span className="font-medium">{report.progress}%</span>
                  </div>
                  <Progress value={report.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Le projet est {report.progress < 50 ? "en phase initiale" : 
                        report.progress < 80 ? "en bonne progression" : 
                        "en phase finale"}.
                  </p>
                </div>
              </div>

              {shouldShowSection("photos") && report.photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Photos du site</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {report.photos.map((photo, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-2 text-center">
                          <p className="text-sm text-muted-foreground">Photo {index + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowSection("observations") && report.observations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Observations</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Item</TableHead>
                        <TableHead>Observation</TableHead>
                        <TableHead>Description détaillée</TableHead>
                        <TableHead>Photo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.observations.map((obs) => (
                        <TableRow key={obs.id}>
                          <TableCell>{obs.item}</TableCell>
                          <TableCell>{obs.observation}</TableCell>
                          <TableCell>{obs.description}</TableCell>
                          <TableCell>
                            {obs.photoUrl ? (
                              <Button variant="outline" size="sm" className="h-8" asChild>
                                <a href={obs.photoUrl} target="_blank" rel="noreferrer">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Voir
                                </a>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {shouldShowSection("recommendations") && report.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Recommandations</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Item</TableHead>
                        <TableHead>Observation</TableHead>
                        <TableHead>Action recommandée</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.recommendations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell>{rec.item}</TableCell>
                          <TableCell>{rec.observation}</TableCell>
                          <TableCell>{rec.action}</TableCell>
                          <TableCell>{rec.responsible}</TableCell>
                          <TableCell>{getStatusBadge(rec.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {shouldShowSection("additionalDetails") && report.additionalDetails && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Informations supplémentaires</h3>
                  <Card>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{report.additionalDetails}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {shouldShowSection("documents") && report.attachments && report.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Documents joints</h3>
                  <div className="space-y-2">
                    {report.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-2 border rounded-md">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="flex-1">Document {index + 1}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={attachment} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowSection("signatures") && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Signatures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Signature du responsable</p>
                      {report.signatures.inCharge ? (
                        <img 
                          src={report.signatures.inCharge} 
                          alt="Signature du responsable" 
                          className="h-16 mx-auto"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center border-dashed border-2 rounded">
                          <p className="text-muted-foreground">Non signé</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {report.inCharge}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Signature de l'ingénieur</p>
                      {report.signatures.engineer ? (
                        <img 
                          src={report.signatures.engineer} 
                          alt="Signature de l'ingénieur" 
                          className="h-16 mx-auto"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center border-dashed border-2 rounded">
                          <p className="text-muted-foreground">Non signé</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Ingénieur
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Signature du visiteur</p>
                      {report.signatures.visitor ? (
                        <img 
                          src={report.signatures.visitor} 
                          alt="Signature du visiteur" 
                          className="h-16 mx-auto"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center border-dashed border-2 rounded">
                          <p className="text-muted-foreground">Non signé</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        Visiteur
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <ReportFooter />
      </div>

      {/* Dialogue d'aperçu PDF */}
      <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Aperçu PDF du rapport</DialogTitle>
            <DialogDescription>
              Aperçu du rapport au format PDF
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md p-4 h-full">
            <div className="bg-white p-6 min-h-[600px]">
              {/* Clone du contenu du rapport pour l'aperçu PDF */}
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Compte Rendu de Visite</h1>
                <p className="text-sm text-muted-foreground">Rapport #{report.reportNumber}</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-2">Projet: {project.name}</h2>
                <p>Date de visite: {formatDate(report.visitDate)}</p>
                <p>Responsable: {report.inCharge}</p>
                <p>Entreprise: {report.contractor}</p>
                <p>Progression: {report.progress}%</p>
              </div>

              {/* Contenu simplifié du rapport */}
              {shouldShowSection("observations") && report.observations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Observations</h3>
                  {report.observations.map((obs, idx) => (
                    <div key={obs.id} className="mb-4 p-2 border-b">
                      <p><strong>{idx + 1}. {obs.observation}</strong></p>
                      <p className="text-sm">{obs.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Autres sections seraient ajoutées ici */}
              
              <div className="text-center text-sm text-muted-foreground mt-8 pt-4 border-t">
                <p>Ce document est généré automatiquement et ne nécessite pas de signature manuscrite.</p>
                <p>© {new Date().getFullYear()} Votre Cabinet d'Architecture</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPdfPreviewOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => toast.success("PDF téléchargé")}>
              <Download className="h-4 w-4 mr-2" /> 
              Télécharger PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SiteVisitReportDetail;
