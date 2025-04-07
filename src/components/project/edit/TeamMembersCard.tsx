
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMember as LegacyTeamMember } from "@/services/team";

interface TeamMembersCardProps {
  teamMembers: LegacyTeamMember[];
  selectedTeamMembers: string[];
  onSelectTeamMember: (memberId: string) => void;
}

export const TeamMembersCard = ({ teamMembers, selectedTeamMembers, onSelectTeamMember }: TeamMembersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Équipe du projet</CardTitle>
        <CardDescription>Sélectionnez les membres de l'équipe pour ce projet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre d'équipe disponible</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`team-member-${member.id}`} 
                    checked={selectedTeamMembers.includes(member.id)}
                    onCheckedChange={() => onSelectTeamMember(member.id)}
                  />
                  <Label htmlFor={`team-member-${member.id}`} className="cursor-pointer flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {selectedTeamMembers.length} membre{selectedTeamMembers.length !== 1 ? "s" : ""} sélectionné{selectedTeamMembers.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
};
