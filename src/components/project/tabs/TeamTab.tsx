
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TeamTabProps {
  teamMembers: TeamMember[];
}

export const TeamTab = ({ teamMembers }: TeamTabProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Équipe</CardTitle>
            <CardDescription>Membres de l'équipe travaillant sur ce projet</CardDescription>
          </div>
          <Button onClick={() => navigate('/team')}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un membre
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => (
            <div key={member.id} className="border rounded-lg p-4 flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/team/${member.id}`)}>Profil</Button>
                <Button variant="outline" size="sm">Message</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
