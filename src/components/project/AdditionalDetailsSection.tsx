
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { SiteVisitReportUploader } from "@/components/project/SiteVisitReportUploader";
import { toast } from "sonner";

interface AdditionalDetailsSectionProps {
  form: UseFormReturn<any>;
  showSignatures: boolean;
  formSchema: z.ZodObject<any>;
}

export const AdditionalDetailsSection = ({ 
  form, 
  showSignatures, 
  formSchema
}: AdditionalDetailsSectionProps) => {
  
  const handleSignature = (role: string, url: string) => {
    toast.success(`Signature ${role} ajoutée`);
    console.log(`Signature ${role} added: ${url}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations supplémentaires</CardTitle>
        <CardDescription>Détails complémentaires sur la visite</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="additionalDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Détails supplémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Entrez tout détail supplémentaire concernant cette visite..." 
                  className="min-h-32" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showSignatures && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium">Signatures</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Signature du responsable</p>
                <SiteVisitReportUploader
                  type="signature"
                  variant="button"
                  text="Signer"
                  icon={<Pencil className="h-4 w-4 mr-2" />}
                  onFileUploaded={(url) => handleSignature("responsable", url)}
                />
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Signature de l'ingénieur</p>
                <SiteVisitReportUploader
                  type="signature"
                  variant="button"
                  text="Signer"
                  icon={<Pencil className="h-4 w-4 mr-2" />}
                  onFileUploaded={(url) => handleSignature("ingénieur", url)}
                />
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Signature du visiteur</p>
                <SiteVisitReportUploader
                  type="signature"
                  variant="button"
                  text="Signer"
                  icon={<Pencil className="h-4 w-4 mr-2" />}
                  onFileUploaded={(url) => handleSignature("visiteur", url)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
