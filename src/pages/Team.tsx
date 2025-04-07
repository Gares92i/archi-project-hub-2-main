
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { TeamMemberManager } from "@/components/team/TeamMemberManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const TeamPage = () => {
  const { profile } = useProfile();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('Mon Équipe');
  const [storedTeams, setStoredTeams] = useLocalStorage('user_teams', []);

  // Fonction simplifiée pour créer une équipe locale
  const handleCreateTeam = () => {
    const newTeam = {
      id: crypto.randomUUID(),
      name: teamName,
      owner_id: profile?.id || 'anonymous',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setStoredTeams([...storedTeams, newTeam]);
    setShowCreateTeam(false);
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateTeam(!showCreateTeam)}
          className="shrink-0 sync-button-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {showCreateTeam ? "Annuler" : "Créer une équipe"}
        </Button>
      </div>

      {showCreateTeam && (
        <Card className="mb-6 sync-card">
          <CardHeader>
            <CardTitle>Créer une nouvelle équipe</CardTitle>
            <CardDescription>Créez une équipe pour collaborer avec d'autres membres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="team-name" className="block text-sm font-medium mb-1">
                  Nom de l'équipe
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Entrez un nom d'équipe"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateTeam} className="sync-button-primary">
                  Créer l'équipe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <Card className="sync-card">
          <CardHeader>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-sync-teal" />
              <CardTitle>Récapitulatif de l'équipe</CardTitle>
            </div>
            <CardDescription>
              Vue d'ensemble de votre équipe et de ses membres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-sync-beige rounded-lg p-4">
                <h3 className="text-lg font-medium mb-1">Membres</h3>
                <p className="text-3xl font-bold text-sync-teal">5</p>
                <p className="text-sync-teal-light text-sm">Membres actifs</p>
              </div>
              <div className="bg-sync-beige rounded-lg p-4">
                <h3 className="text-lg font-medium mb-1">Projets</h3>
                <p className="text-3xl font-bold text-sync-teal">3</p>
                <p className="text-sync-teal-light text-sm">Projets en cours</p>
              </div>
              <div className="bg-sync-beige rounded-lg p-4">
                <h3 className="text-lg font-medium mb-1">Tâches</h3>
                <p className="text-3xl font-bold text-sync-teal">12</p>
                <p className="text-sync-teal-light text-sm">Tâches assignées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TeamMemberManager />
    </MainLayout>
  );
};

export default TeamPage;
