
import { useState } from "react";
import { Download, FileText, Image, MoreVertical, FileArchive, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Resource } from "@/components/resources/types";

const iconByType = {
  document: <FileText className="h-6 w-6" />,
  image: <Image className="h-6 w-6" />,
  video: <Video className="h-6 w-6" />,
  archive: <FileArchive className="h-6 w-6" />,
  other: <FileText className="h-6 w-6" />,
};

const colorByType = {
  document: "bg-blue-100 text-blue-700",
  image: "bg-purple-100 text-purple-700",
  video: "bg-red-100 text-red-700",
  archive: "bg-yellow-100 text-yellow-700",
  other: "bg-gray-100 text-gray-700",
};

interface ResourceListProps {
  resources: Resource[];
  selectedCategory: string;
}

export const ResourceList = ({ resources, selectedCategory }: ResourceListProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 font-medium">Nom</th>
            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Type</th>
            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Taille</th>
            <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Ajouté par</th>
            <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Date</th>
            <th className="text-left py-3 px-4 font-medium">Téléch.</th>
            <th className="py-3 px-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {resources
            .filter(
              (resource) =>
                selectedCategory === "all" ||
                resource.category === selectedCategory
            )
            .map((resource) => (
              <tr
                key={resource.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${colorByType[resource.type]}`}>
                      {iconByType[resource.type]}
                    </div>
                    <span className="font-medium">{resource.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  {resource.type === "document"
                    ? "Document"
                    : resource.type === "image"
                    ? "Image"
                    : resource.type === "video"
                    ? "Vidéo"
                    : resource.type === "archive"
                    ? "Archive"
                    : "Autre"}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">{resource.size}</td>
                <td className="py-3 px-4 hidden lg:table-cell">{resource.uploadedBy}</td>
                <td className="py-3 px-4 hidden lg:table-cell">{formatDate(resource.uploadedAt)}</td>
                <td className="py-3 px-4">{resource.downloads}</td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                      <DropdownMenuItem>Partager</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
