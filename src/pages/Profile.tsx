
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SiteVisitReportUploader } from '@/components/project/SiteVisitReportUploader';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile, roles, isLoading, subscription } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    company: profile?.company || '',
    title: profile?.title || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateProfile(formData);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = () => {
    const firstName = formData.first_name || '';
    const lastName = formData.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Profil</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
                <CardDescription>Vos informations de compte</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={formData.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">
                    {formData.first_name} {formData.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {formData.title && (
                    <p className="text-sm mt-1">{formData.title}</p>
                  )}
                  {formData.company && (
                    <p className="text-sm text-muted-foreground">{formData.company}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {roles.map(role => {
                    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                    if (role === 'admin') variant = "destructive";
                    if (role === 'architect') variant = "default";
                    if (role === 'client') variant = "secondary";
                    
                    return (
                      <Badge key={role} variant={variant}>
                        {role === 'admin' && 'Administrateur'}
                        {role === 'architect' && 'Architecte'}
                        {role === 'client' && 'Client'}
                        {role === 'contractor' && 'Entrepreneur'}
                      </Badge>
                    );
                  })}
                </div>

                {subscription && (
                  <div className="mt-4">
                    <Badge variant="default" className="mb-2">
                      Plan {subscription.plan_type}
                    </Badge>
                    <p className="text-xs text-muted-foreground text-center">
                      Renouvellement le {new Date(subscription.current_period_end || '').toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Modifier votre profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nom</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Fonction</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Architecte principal, Chef de projet, etc."
                      value={formData.title || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Nom de votre entreprise"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photo de profil</Label>
                    <SiteVisitReportUploader
                      onFileUploaded={handleAvatarUpload}
                      type="image"
                      displayPreview={true}
                      accept="image/*"
                    />
                    {formData.avatar_url && (
                      <div className="mt-2">
                        <img
                          src={formData.avatar_url}
                          alt="Aperçu"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
