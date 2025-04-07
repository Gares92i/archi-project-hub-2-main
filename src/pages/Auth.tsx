
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginFormValues, SignupFormValues } from '@/schemas/authSchemas';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import AiHelper from '@/components/auth/AiHelper';
import AuthFooter from '@/components/auth/AuthFooter';

const Auth = () => {
  const { signIn, signUp, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Rediriger vers la page d'origine si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setError('');
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      setError('');
      const { email, password, first_name, last_name } = data;
      await signUp(email, password, { first_name, last_name });
      setActiveTab('login');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ArchiPro</h1>
          <p className="text-muted-foreground">Plateforme de gestion pour les professionnels de l'architecture</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Compte</CardTitle>
                <CardDescription>
                  Connectez-vous ou créez un compte pour accéder à la plateforme
                </CardDescription>
              </div>
              <AiHelper activeTab={activeTab} />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <TabsContent value="login">
                <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm onSubmit={onSignupSubmit} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center">
            <AuthFooter activeTab={activeTab} onTabChange={setActiveTab} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
