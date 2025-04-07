
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TeamMember as LegacyTeamMember } from "@/services/team";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteVisitReportUploader } from "@/components/project/SiteVisitReportUploader";
import { UserCircle } from "lucide-react";

interface TeamMemberFormProps {
  isEdit: boolean;
  member?: Partial<LegacyTeamMember>;
  teamId: string | null;
  onSubmit: (data: LegacyTeamMember) => Promise<void>;
  onCancel: () => void;
}

export const TeamMemberForm = ({ 
  isEdit = false, 
  member, 
  teamId, 
  onSubmit, 
  onCancel 
}: TeamMemberFormProps) => {
  const [formData, setFormData] = useState<Partial<LegacyTeamMember>>({
    id: member?.id || "",
    name: member?.name || "",
    role: member?.role || "",
    email: member?.email || "",
    phone: member?.phone || "",
    projects: member?.projects || [],
    avatar: member?.avatar || "",
    status: member?.status || "active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.role || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData as LegacyTeamMember);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setFormData({...formData, avatar: url});
    toast.success("Photo de profil ajoutée");
  };

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{isEdit ? "Modifier le membre" : "Ajouter un membre"}</SheetTitle>
        <SheetDescription>
          {isEdit 
            ? "Modifiez les informations du membre de l'équipe."
            : "Ajoutez un nouveau membre à votre équipe de projet."
          }
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        <div className="flex flex-col items-center mb-4">
          <div className="mb-2">
            {formData.avatar ? (
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} alt={formData.name || "Avatar"} />
                <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <UserCircle className="h-12 w-12" />
              </div>
            )}
          </div>
          <SiteVisitReportUploader
            onFileUploaded={handleAvatarUpload}
            type="image"
            variant="button"
            text="Changer la photo"
            size="sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-name">Nom complet</Label>
          <Input 
            id="member-name" 
            placeholder="Nom et prénom" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-email">Email</Label>
          <Input 
            id="member-email" 
            type="email" 
            placeholder="email@exemple.fr" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-phone">Téléphone</Label>
          <Input 
            id="member-phone" 
            type="tel" 
            placeholder="01 23 45 67 89" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-role">Rôle / Fonction</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData({...formData, role: value})}
          >
            <SelectTrigger id="member-role">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="architect">Architecte</SelectItem>
              <SelectItem value="engineer">Ingénieur</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="project_manager">Chef de projet</SelectItem>
              <SelectItem value="consultant">Consultant</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="member-status">Statut</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: "active" | "offline" | "busy") => setFormData({...formData, status: value})}
          >
            <SelectTrigger id="member-status">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="offline">Hors ligne</SelectItem>
              <SelectItem value="busy">Occupé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <SheetFooter className="mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : (isEdit ? "Enregistrer les modifications" : "Ajouter le membre")}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
};
