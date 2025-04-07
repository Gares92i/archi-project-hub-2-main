
import { SiteVisitReport, Observation, Recommendation, ArchitectInfo } from "./types";
import { updateProject } from "./projectService";

// Mock data
let reports: SiteVisitReport[] = [
  {
    id: "1",
    projectId: "1",
    visitDate: "2023-06-15",
    contractor: "Entreprise Martin",
    inCharge: "Jean Dupont",
    progress: 35,
    observations: [
      {
        id: "obs1",
        item: 1,
        observation: "Fondations",
        description: "Les fondations sont terminées selon les plans.",
        photoUrl: "/placeholder.svg"
      },
      {
        id: "obs2",
        item: 2,
        observation: "Murs",
        description: "Les murs du rez-de-chaussée sont en cours de montage. Retard d'une semaine.",
        photoUrl: "/placeholder.svg"
      }
    ],
    recommendations: [
      {
        id: "rec1",
        item: 1,
        observation: "Retard murs",
        action: "Ajouter une équipe supplémentaire pour rattraper le retard",
        responsible: "Martin Construction",
        status: "pending"
      }
    ],
    photos: ["/placeholder.svg", "/placeholder.svg"],
    signatures: {
      inCharge: "signature1.png",
      engineer: "signature2.png"
    },
    reportNumber: "SVR-2023-001",
    templateId: "standard",
    createdAt: "2023-06-15T14:30:00",
    updatedAt: "2023-06-15T14:30:00"
  },
  {
    id: "2",
    projectId: "1",
    visitDate: "2023-06-22",
    contractor: "Entreprise Martin",
    inCharge: "Jean Dupont",
    progress: 42,
    observations: [
      {
        id: "obs3",
        item: 1,
        observation: "Murs",
        description: "Les murs du rez-de-chaussée sont terminés.",
        photoUrl: "/placeholder.svg"
      },
      {
        id: "obs4",
        item: 2,
        observation: "Plomberie",
        description: "Installation de la plomberie principale commencée.",
        photoUrl: "/placeholder.svg"
      }
    ],
    recommendations: [
      {
        id: "rec2",
        item: 1,
        observation: "Vérification plomberie",
        action: "Faire un test d'étanchéité avant la pose du plancher",
        responsible: "Plombiers Associés",
        status: "in-progress"
      }
    ],
    photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    signatures: {
      inCharge: "signature1.png",
      engineer: "signature2.png",
      visitor: "signature3.png"
    },
    reportNumber: "SVR-2023-002",
    templateId: "detailed",
    createdAt: "2023-06-22T15:15:00",
    updatedAt: "2023-06-22T15:15:00"
  }
];

// Mock architect info
export const getArchitectInfo = async (): Promise<ArchitectInfo> => {
  return {
    name: "Cabinet d'Architecture Moderne",
    address: "15 rue de l'Innovation, 75001 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@architecturemoderne.fr",
    logo: "/placeholder.svg"
  };
};

// Generate a unique report number
const generateReportNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const count = reports.length + 1;
  return `SVR-${year}-${count.toString().padStart(3, '0')}`;
};

export const getAllReportsByProjectId = async (projectId: string): Promise<SiteVisitReport[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const projectReports = reports.filter(report => report.projectId === projectId);
      resolve(projectReports);
    }, 500);
  });
};

export const getReportById = async (reportId: string): Promise<SiteVisitReport | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const report = reports.find(r => r.id === reportId) || null;
      resolve(report);
    }, 500);
  });
};

export const addReport = async (report: Omit<SiteVisitReport, "id" | "createdAt" | "updatedAt" | "reportNumber">): Promise<SiteVisitReport> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(async () => {
      const reportNumber = generateReportNumber();
      const newReport = {
        ...report,
        id: Math.random().toString(36).substr(2, 9),
        reportNumber,
        templateId: report.templateId || "standard", // Default to standard if not specified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      reports.push(newReport);
      
      // Update the project progress
      try {
        await updateProject(report.projectId, {
          progress: report.progress
        });
        console.log(`Project ${report.projectId} progress updated to ${report.progress}%`);
      } catch (error) {
        console.error("Error updating project progress:", error);
      }
      
      resolve(newReport);
    }, 500);
  });
};

export const updateReport = async (reportId: string, reportData: Partial<SiteVisitReport>): Promise<SiteVisitReport | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(async () => {
      const reportIndex = reports.findIndex(r => r.id === reportId);
      if (reportIndex === -1) {
        resolve(null);
        return;
      }
      
      const updatedReport = {
        ...reports[reportIndex],
        ...reportData,
        updatedAt: new Date().toISOString()
      };
      
      reports[reportIndex] = updatedReport;
      
      // Update the project progress if it has changed
      if (reportData.progress !== undefined && 
          reportData.progress !== reports[reportIndex].progress) {
        try {
          await updateProject(updatedReport.projectId, {
            progress: reportData.progress
          });
          console.log(`Project ${updatedReport.projectId} progress updated to ${reportData.progress}%`);
        } catch (error) {
          console.error("Error updating project progress:", error);
        }
      }
      
      resolve(updatedReport);
    }, 500);
  });
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = reports.length;
      reports = reports.filter(r => r.id !== reportId);
      resolve(reports.length < initialLength);
    }, 500);
  });
};

// Simulated file upload
export const uploadFile = async (file: File): Promise<string> => {
  // In a real app, this would upload to cloud storage
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a temporary URL for the file to preview it
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      } else {
        // Return a fake URL for non-image files
        resolve("/placeholder.svg");
      }
    }, 1000);
  });
};

// Add a document attachment to a report
export const addAttachment = async (reportId: string, file: File): Promise<SiteVisitReport | null> => {
  try {
    const fileUrl = await uploadFile(file);
    const report = await getReportById(reportId);
    
    if (!report) return null;
    
    const attachments = report.attachments || [];
    const updatedReport = await updateReport(reportId, {
      attachments: [...attachments, fileUrl]
    });
    
    return updatedReport;
  } catch (error) {
    console.error("Error adding attachment:", error);
    return null;
  }
};
