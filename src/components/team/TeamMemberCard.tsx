
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Pencil, Phone, Trash2 } from "lucide-react";
import { TeamMember } from "@/types/team";
import { toast } from "sonner";
import { getMemberDetails } from "./utils/memberUtils";

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export const TeamMemberCard = ({ member, onEdit, onDelete }: TeamMemberCardProps) => {
  const { 
    memberName,
    memberEmail,
    memberPhone,
    memberCompany,
    avatarUrl,
    initials,
    avatarColor
  } = getMemberDetails(member);

  // Handle sending a message to a member
  const handleSendMessage = () => {
    toast.info(`Envoi d'un message à ${memberName}`, {
      description: "Fonctionnalité à implémenter"
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={memberName} />
                ) : (
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <span
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"
              ></span>
            </div>
            <div>
              <CardTitle className="text-base">{memberName}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(member)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendMessage}>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer un message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => onDelete(member)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{memberEmail}</span>
          </div>
          {memberPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{memberPhone}</span>
            </div>
          )}
          {memberCompany && (
            <div className="text-sm text-muted-foreground mt-2">
              {memberCompany}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
