
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SiteVisitReportsList } from "@/components/project/SiteVisitReportsList";

interface ReportsTabProps {
  projectId: string;
  formatDate: (dateString: string) => string;
}

export const ReportsTab = ({ projectId, formatDate }: ReportsTabProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Comptes Rendus de Visite</CardTitle>
            <CardDescription>Rapports hebdomadaires des visites de chantier</CardDescription>
          </div>
          <Button onClick={() => navigate(`/projects/${projectId}/report/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Compte Rendu
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SiteVisitReportsList formatDate={formatDate} />
      </CardContent>
    </Card>
  );
};
