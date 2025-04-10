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
  FilePlus,
  Paperclip
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
import { SiteVisitReport } from "@/components/services/reportSer";
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
  // Removed duplicate declaration of printSectionRef

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

  // Référence pour la section à imprimer
  const printSectionRef = useRef<HTMLDivElement>(null);

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

  // Ajoutez cette fonction pour l'impression correcte

  // Fonction pour imprimer uniquement le contenu du rapport
  const handlePrint = () => {
    if (printSectionRef.current) {
      const printContent = printSectionRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      // Création d'une feuille de style pour l'impression
      const printStyles = `
        body { font-family: Arial, sans-serif; margin: 30px; }
        .print-header { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .participants-bar { background-color: #f4f4f9; padding: 15px; margin-bottom: 10px; }
        .status { display: flex; align-items: center; margin-right: 10px; }
        .letter { display: inline-block; width: 24px; height: 24px; border-radius: 50%; text-align: center; margin-right: 5px; border: 2px solid; }
        @page { margin: 2cm; }
      `;

      // Création d'un document d'impression avec les styles nécessaires
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Compte-rendu de visite - ${report.reportNumber}</title>
            <style>${printStyles}</style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();

        // Déclencher l'impression après le chargement complet
        printWindow.addEventListener('load', () => {
          printWindow.print();
          printWindow.close();
        }, true);
      } else {
        // Fallback si la fenêtre popup est bloquée
        document.body.innerHTML = printContent;
        document.head.innerHTML = `<style>${printStyles}</style>`;
        window.print();
        document.body.innerHTML = originalContent;
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mr-4">
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
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={generatePdfPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualiser PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Rapport envoyé par email")}>
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
          <Button
            onClick={() =>
              navigate(`/projects/${projectId}/report/${reportId}/edit`)
            }>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Progression du projet
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Progression:</span>
                    <span className="font-medium">{report.progress}%</span>
                  </div>
                  <Progress value={report.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Le projet est{" "}
                    {report.progress < 50
                      ? "en phase initiale"
                      : report.progress < 80
                      ? "en bonne progression"
                      : "en phase finale"}
                    .
                  </p>
                </div>
              </div>

              {/* Section des participants */}
              <div className="mt-6">
                {/* En-tête stylisé comme demandé */}
                <div
                  className="participants-bar"
                  style={{
                    backgroundColor: "#f4f4f9",
                    padding: "15px 30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #ccc",
                    borderTopLeftRadius: "0.375rem",
                    borderTopRightRadius: "0.375rem",
                  }}>
                  <span
                    className="title"
                    style={{
                      color: "#007bff",
                      fontWeight: "bold",
                      fontSize: "16px",
                      textTransform: "none",
                    }}>
                    Participants
                  </span>
                  <div
                    className="status-group"
                    style={{
                      display: "flex",
                      gap: "20px",
                    }}>
                    <span
                      className="status present"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "#28a745",
                      }}>
                      <span
                        className="letter"
                        style={{
                          display: "inline-block",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          textAlign: "center",
                          lineHeight: "20px",
                          marginRight: "6px",
                          fontWeight: "bold",
                          border: "2px solid #28a745",
                          color: "#28a745",
                        }}>
                        P
                      </span>{" "}
                      Présent
                    </span>
                    <span
                      className="status late"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "#fd7e14",
                      }}>
                      <span
                        className="letter"
                        style={{
                          display: "inline-block",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          textAlign: "center",
                          lineHeight: "20px",
                          marginRight: "6px",
                          fontWeight: "bold",
                          border: "2px solid #fd7e14",
                          color: "#fd7e14",
                        }}>
                        R
                      </span>{" "}
                      Retard
                    </span>
                    <span
                      className="status absent"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "#dc3545",
                      }}>
                      <span
                        className="letter"
                        style={{
                          display: "inline-block",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          textAlign: "center",
                          lineHeight: "20px",
                          marginRight: "6px",
                          fontWeight: "bold",
                          border: "2px solid #dc3545",
                          color: "#dc3545",
                        }}>
                        A
                      </span>{" "}
                      Absent
                    </span>
                    <span
                      className="status excused"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: "#007bff",
                      }}>
                      <span
                        className="letter"
                        style={{
                          display: "inline-block",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          textAlign: "center",
                          lineHeight: "20px",
                          marginRight: "6px",
                          fontWeight: "bold",
                          border: "2px solid #007bff",
                          color: "#007bff",
                        }}>
                        E
                      </span>{" "}
                      Excusé
                    </span>
                  </div>
                </div>

                {/* Tableau des participants */}
                <Card className="rounded-t-none border-t-0">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Adresse</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead className="text-center">
                            Présence
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.participants &&
                        report.participants.length > 0 ? (
                          report.participants.map((participant, index) => (
                            <TableRow key={index}>
                              <TableCell>{participant.role}</TableCell>
                              <TableCell>{participant.contact}</TableCell>
                              <TableCell>{participant.address}</TableCell>
                              <TableCell>{participant.email}</TableCell>
                              <TableCell>{participant.phone}</TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className={
                                    participant.presence === "P"
                                      ? "bg-green-500"
                                      : participant.presence === "R"
                                      ? "bg-orange-500"
                                      : participant.presence === "A"
                                      ? "bg-red-500"
                                      : "bg-blue-500"
                                  }>
                                  {participant.presence}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-muted-foreground">
                              Aucun participant enregistré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Section des réserves/annotations */}
              {shouldShowSection("reserves") &&
                report.reserves &&
                report.reserves.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Réserves et annotations
                    </h3>
                    <Card>
                      <CardContent className="p-6">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>N°</TableHead>
                              <TableHead>Localisation</TableHead>
                              <TableHead>Lot</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Levée le</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.reserves.map((reserve, index) => (
                              <TableRow key={reserve.id || index}>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-800 border border-orange-500 font-medium text-xs">
                                      {index + 1}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>{reserve.location}</TableCell>
                                <TableCell>{reserve.lot}</TableCell>
                                <TableCell className="align-top text-sm">
                                  <div className="flex flex-col justify-start gap-2">
                                    {/* Description */}
                                    <div className="text-muted-foreground">
                                      {reserve.description}
                                    </div>

                                    {/* Image si présente */}
                                    {reserve.photos &&
                                      reserve.photos.length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <Paperclip className="h-4 w-4 text-muted-foreground mt-1" />
                                          <img
                                            src={reserve.photos[0]}
                                            alt={`Photo réserve ${index + 1}`}
                                            className="h-28 w-auto object-contain rounded-md border"
                                          />
                                        </div>
                                      )}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  {formatDate(reserve.createdAt)}
                                </TableCell>
                                <TableCell>
                                  {reserve.resolvedAt ? (
                                    formatDate(reserve.resolvedAt)
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      Non levée
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}

              {shouldShowSection("photos") && report.photos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Photos du site</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {report.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="border rounded-md overflow-hidden">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-2 text-center">
                          <p className="text-sm text-muted-foreground">
                            Photo {index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shouldShowSection("observations") &&
                report.observations.length > 0 && (
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  asChild>
                                  <a
                                    href={obs.photoUrl}
                                    target="_blank"
                                    rel="noreferrer">
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

              {shouldShowSection("recommendations") &&
                report.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Recommandations
                    </h3>
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

              {shouldShowSection("additionalDetails") &&
                report.additionalDetails && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Informations supplémentaires
                    </h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap">
                          {report.additionalDetails}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

              {shouldShowSection("documents") &&
                report.attachments &&
                report.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Documents joints
                    </h3>
                    <div className="space-y-2">
                      {report.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border rounded-md">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="flex-1">Document {index + 1}</span>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noreferrer">
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Signature du responsable
                      </p>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Signature de l'ingénieur
                      </p>
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
                      <p className="text-sm text-muted-foreground mb-2">
                        Signature du visiteur
                      </p>
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
              {/* En-tête du PDF */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <img
                      src="/placeholder.svg"
                      alt="Logo"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{project.name}</h2>
                    <p className="text-sm">Cabinet d'Architecture Moderne</p>
                    <p className="text-sm">
                      15 rue de l'Innovation, 75001 Paris
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">COMPTE RENDU DE VISITE</h3>
                  <p className="text-sm">Réf: {report.reportNumber}</p>
                  <p className="text-sm">
                    Date de visite: {formatDate(report.visitDate)}
                  </p>
                </div>
              </div>

              <hr className="mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium">Projet</h4>
                  <p>{project.name}</p>
                  <p className="text-sm">{project.location}</p>
                </div>
                <div>
                  <h4 className="font-medium">Client</h4>
                  <p>{project.client}</p>
                  <p className="text-sm">
                    Période: {formatDate(project.startDate)} -{" "}
                    {formatDate(project.endDate)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium">Résumé de la visite</h4>
                <p className="text-sm">Responsable: {report.inCharge}</p>
                <p className="text-sm">Entreprise: {report.contractor}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression:</span>
                    <span>{report.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${report.progress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Section participants du PDF */}
              <div className="mb-6">
                <div className="bg-gray-100 p-3 mb-2 flex justify-between items-center">
                  <h4 className="font-medium text-blue-600">PARTICIPANTS</h4>
                  <div className="flex gap-3 text-xs">
                    <span>
                      <strong className="border rounded-full w-5 h-5 inline-block text-center border-green-600 text-green-600">
                        P
                      </strong>{" "}
                      Présent
                    </span>
                    <span>
                      <strong className="border rounded-full w-5 h-5 inline-block text-center border-orange-600 text-orange-600">
                        R
                      </strong>{" "}
                      Retard
                    </span>
                    <span>
                      <strong className="border rounded-full w-5 h-5 inline-block text-center border-red-600 text-red-600">
                        A
                      </strong>{" "}
                      Absent
                    </span>
                    <span>
                      <strong className="border rounded-full w-5 h-5 inline-block text-center border-blue-600 text-blue-600">
                        E
                      </strong>{" "}
                      Excusé
                    </span>
                  </div>
                </div>
                <div className="border p-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Rôle</th>
                        <th className="text-left pb-2">Contact</th>
                        <th className="text-left pb-2">Email/Téléphone</th>
                        <th className="text-center pb-2">Présence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1">Maître d'ouvrage</td>
                        <td className="py-1">Belleville Sté</td>
                        <td className="py-1">contact@belleville.com</td>
                        <td className="py-1 text-center">
                          <span className="inline-block border rounded-full w-5 h-5 text-center border-green-600 text-green-600">
                            P
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Architecte</td>
                        <td className="py-1">ArchiHub Studio</td>
                        <td className="py-1">contact@archihub.fr</td>
                        <td className="py-1 text-center">
                          <span className="inline-block border rounded-full w-5 h-5 text-center border-green-600 text-green-600">
                            P
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Photos dans le PDF */}
              {shouldShowSection("photos") && report.photos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Photos du site</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {report.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="border">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {report.photos.length > 4 && (
                    <p className="text-center text-xs mt-2">
                      +{report.photos.length - 4} autres photos
                    </p>
                  )}
                </div>
              )}

              {/* Observations dans le PDF */}
              {shouldShowSection("observations") &&
                report.observations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Observations</h4>
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-2 border">#</th>
                          <th className="text-left p-2 border">Élément</th>
                          <th className="text-left p-2 border">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.observations.map((obs) => (
                          <tr key={obs.id} className="border-b">
                            <td className="p-2 border">{obs.item}</td>
                            <td className="p-2 border">{obs.observation}</td>
                            <td className="p-2 border">{obs.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Recommandations dans le PDF */}
              {shouldShowSection("recommendations") &&
                report.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Recommandations</h4>
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-2 border">#</th>
                          <th className="text-left p-2 border">Observation</th>
                          <th className="text-left p-2 border">
                            Action requise
                          </th>
                          <th className="text-left p-2 border">Responsable</th>
                          <th className="text-left p-2 border">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.recommendations.map((rec) => (
                          <tr key={rec.id} className="border-b">
                            <td className="p-2 border">{rec.item}</td>
                            <td className="p-2 border">{rec.observation}</td>
                            <td className="p-2 border">{rec.action}</td>
                            <td className="p-2 border">{rec.responsible}</td>
                            <td className="p-2 border">
                              {rec.status === "pending"
                                ? "En attente"
                                : rec.status === "in-progress"
                                ? "En cours"
                                : rec.status === "completed"
                                ? "Terminé"
                                : rec.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Détails supplémentaires dans le PDF */}
              {shouldShowSection("additionalDetails") &&
                report.additionalDetails && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">
                      Informations supplémentaires
                    </h4>
                    <div className="border p-3 text-sm whitespace-pre-wrap">
                      {report.additionalDetails}
                    </div>
                  </div>
                )}

              {/* Documents joints dans le PDF */}
              {shouldShowSection("documents") &&
                report.attachments &&
                report.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Documents joints</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {report.attachments.map((attachment, index) => (
                        <li key={index} className="mb-1">
                          Document {index + 1}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Signatures dans le PDF */}
              {shouldShowSection("signatures") && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Signatures</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="border p-3 text-center">
                      <p className="text-sm font-medium">Responsable</p>
                      <div className="h-16 flex items-center justify-center">
                        {report.signatures.inCharge ? (
                          <img
                            src={report.signatures.inCharge}
                            alt="Signature responsable"
                            className="h-12"
                          />
                        ) : (
                          <p className="text-xs text-gray-400">
                            Signature non disponible
                          </p>
                        )}
                      </div>
                      <p className="text-xs">{report.inCharge}</p>
                    </div>
                    <div className="border p-3 text-center">
                      <p className="text-sm font-medium">Ingénieur</p>
                      <div className="h-16 flex items-center justify-center">
                        {report.signatures.engineer ? (
                          <img
                            src={report.signatures.engineer}
                            alt="Signature ingénieur"
                            className="h-12"
                          />
                        ) : (
                          <p className="text-xs text-gray-400">
                            Signature non disponible
                          </p>
                        )}
                      </div>
                      <p className="text-xs">&nbsp;</p>
                    </div>
                    <div className="border p-3 text-center">
                      <p className="text-sm font-medium">Visiteur</p>
                      <div className="h-16 flex items-center justify-center">
                        {report.signatures.visitor ? (
                          <img
                            src={report.signatures.visitor}
                            alt="Signature visiteur"
                            className="h-12"
                          />
                        ) : (
                          <p className="text-xs text-gray-400">
                            Signature non disponible
                          </p>
                        )}
                      </div>
                      <p className="text-xs">&nbsp;</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pied de page du PDF */}
              <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
                <p>
                  Cabinet d'Architecture Moderne - 15 rue de l'Innovation, 75001
                  Paris
                </p>
                <p>+33 1 23 45 67 89 - contact@architecturemoderne.fr</p>
                <p className="mt-2">
                  Ce document est confidentiel et destiné uniquement aux parties
                  concernées.
                </p>
                <p>
                  © {new Date().getFullYear()} Cabinet d'Architecture Moderne
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPdfPreviewOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                toast.success("PDF téléchargé");
                setPdfPreviewOpen(false);
              }}>
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
