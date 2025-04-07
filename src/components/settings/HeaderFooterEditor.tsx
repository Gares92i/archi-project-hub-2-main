
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

export function HeaderFooterEditor() {
  const [activeTab, setActiveTab] = useState("header");
  const [headerLogo, setHeaderLogo] = useState("https://i.pravatar.cc/150?u=4");
  
  const handleSaveTemplate = () => {
    toast.success(`${activeTab === "header" ? "En-tête" : "Pied de page"} enregistré avec succès`);
  };
  
  const handleRevertToDefault = () => {
    toast.info(`${activeTab === "header" ? "En-tête" : "Pied de page"} réinitialisé`);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="header" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="header">En-tête</TabsTrigger>
            <TabsTrigger value="footer">Pied de page</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRevertToDefault}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button size="sm" onClick={handleSaveTemplate}>
              Enregistrer
            </Button>
          </div>
        </div>

        <TabsContent value="header" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Personnalisez l'en-tête qui apparaîtra sur tous vos documents et rapports.
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {headerLogo ? (
                        <div className="relative group">
                          <img 
                            src={headerLogo} 
                            alt="Logo" 
                            className="h-16 w-16 object-contain border rounded-md"
                          />
                          <button className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-16 border rounded-md bg-muted flex items-center justify-center">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xl font-bold">[Nom de l'entreprise]</div>
                      <div className="text-sm text-muted-foreground">[Adresse de l'entreprise]</div>
                      <div className="text-sm text-muted-foreground">[Contact]</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="font-bold text-lg">COMPTE RENDU DE VISITE</h3>
                    <div className="text-sm text-muted-foreground mt-1">Réf: [Numéro de référence]</div>
                    <div className="text-sm text-muted-foreground">Date de visite: [Date]</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headerTitle">Titre du document</Label>
                <Input id="headerTitle" defaultValue="COMPTE RENDU DE VISITE" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headerLogo">Logo</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Éléments à afficher</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="showRef" className="mr-2" defaultChecked />
                    <Label htmlFor="showRef">Référence du document</Label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="showDate" className="mr-2" defaultChecked />
                    <Label htmlFor="showDate">Date de visite</Label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="showProject" className="mr-2" defaultChecked />
                    <Label htmlFor="showProject">Nom du projet</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Personnalisez le pied de page qui apparaîtra sur tous vos documents et rapports.
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-lg p-4">
                <div className="mt-2 pt-2 border-t text-center text-xs text-muted-foreground">
                  <div className="mb-2 flex justify-center">
                    <img 
                      src={headerLogo} 
                      alt="Logo footer" 
                      className="h-8 object-contain" 
                    />
                  </div>
                  <p>ArchiHub Studio - 45 rue de l'Architecture, 75001 Paris</p>
                  <p>+33 1 23 45 67 89 - contact@archihub.fr</p>
                  <p className="mt-2">Ce document est confidentiel et destiné uniquement aux parties concernées.</p>
                  <p>Version imprimée non contrôlée - Page [Page] de [Total]</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footerDisclaimer">Mention de confidentialité</Label>
                <Input 
                  id="footerDisclaimer" 
                  defaultValue="Ce document est confidentiel et destiné uniquement aux parties concernées." 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerLogo">Logo (optionnel)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Éléments à afficher</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="showCompanyInfo" className="mr-2" defaultChecked />
                    <Label htmlFor="showCompanyInfo">Informations de l'entreprise</Label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="showPageNumbers" className="mr-2" defaultChecked />
                    <Label htmlFor="showPageNumbers">Numéros de page</Label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="showVersionInfo" className="mr-2" defaultChecked />
                    <Label htmlFor="showVersionInfo">Information de version</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
